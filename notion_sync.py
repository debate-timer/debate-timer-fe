import os
import json
import re
import datetime
import requests
import pytz

# Import envs
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")
NOTION_USER_UUID_MAP_STR = os.getenv("NOTION_USER_UUID_MAP")
NOTION_API_URL = "https://api.notion.com/v1"

# Parse GitHub ID-Notion UUID map
if NOTION_USER_UUID_MAP_STR:
    NOTION_USER_UUID_MAP = json.loads(NOTION_USER_UUID_MAP_STR)
else:
    print("NOTION_USER_UUID_MAP secret not found or empty.")
    NOTION_USER_UUID_MAP = {}

# Set header for HTTP request
HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

# Load GitHub event payload
def get_github_event_payload():
    event_path = os.getenv("GITHUB_EVENT_PATH")
    if not event_path:
        print("GITHUB_EVENT_PATH is not valid.")
        return None
    with open(event_path, "r") as f:
        return json.load(f)

# Find Notion DB item by GitHub issue id
def find_notion_page_by_github_id(github_id):
    query_url = f"{NOTION_API_URL}/databases/{NOTION_DATABASE_ID}/query"
    payload = {
        "filter": {
            "property": "ID",
            "number": {
                "equals": github_id
            }
        }
    }
    response = requests.post(query_url, headers=HEADERS, json=payload)
    response.raise_for_status()
    results = response.json().get("results")
    return results[0] if results else None

# Create new Notion DB item
def create_notion_page(title, status, github_assignee_id, github_url, github_id):
    create_url = f"{NOTION_API_URL}/pages"

    # Parse Notion user id
    notion_user_id = NOTION_USER_UUID_MAP.get(github_assignee_id, "") if github_assignee_id else ""

    # Parse current time (KST)
    korea_timezone = pytz.timezone('Asia/Seoul')
    current_datetime = datetime.datetime.now(korea_timezone)
    current_datetime_str = current_datetime.isoformat()

    data = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "이름": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            },
            "URL": {
                "url": github_url
            },
            "상태": {
                "select": {
                    "name": status
                }
            },
            "ID": {
                "number": github_id
            },
            "생성 날짜": {
                "date": {
                    "start": current_datetime_str
                }
            }
        }
    }
    if (notion_user_id):
        data["properties"]["작업자"] = {
                "people": [
                    {
                        "id": notion_user_id
                    }
                ]
            }

    response = requests.post(create_url, headers=HEADERS, json=data)
    response.raise_for_status()
    print(f"Notion item created / Title: '{title}', Status: '{status}'")
    return response.json()

# Patch Notion DB item
def update_notion_page_status(page_id, status):
    update_url = f"{NOTION_API_URL}/pages/{page_id}"
    data = {
        "properties": {
            "상태": {
                "select": {
                    "name": status
                }
            }
        }
    }
    response = requests.patch(update_url, headers=HEADERS, json=data)
    response.raise_for_status()
    print(f"Updated status of Notion page '{page_id}' as '{status}'")
    return response.json()

# Handle issue-related event
def handle_issue_event(payload):
    issue = payload.get("issue")
    if not issue:
        print("Issue data is not in payload.")
        return

    action = payload.get("action")
    issue_title = issue.get("title")
    issue_url = issue.get("html_url")
    issue_number = issue.get("number")
    issue_assignees = issue.get("assignees", [])
    issue_assignee_id = issue_assignees[0].get("id") if issue_assignees else None

    if action == "opened":
        print(f"Issue opened: #{issue_number} - {issue_title}")
        # Check duplication
        notion_page = find_notion_page_by_github_id(issue_number)
        if not notion_page:
            create_notion_page(issue_title, "열림", issue_assignee_id, issue_url, issue_number)
        else:
            print(f"Issue #{issue_number} is already in Notion DB. This task will be skipped.")
    else:
        print(f"Not supported action: {action}")

# Handle PR event
def handle_pull_request_event(payload):
    pr = payload.get("pull_request")
    if not pr:
        print("PR data is not in payload.")
        return

    action = payload.get("action")
    pr_title = pr.get("title")
    pr_number = pr.get("number")
    pr_url = pr.get("html_url")
    pr_assignees = pr.get("assignees", [])
    pr_assignee_id = pr_assignees[0].get("id") if pr_assignees else None

    # Find all related issue ID
    body = pr.get("body", "")
    issue_ids = re.findall(r"(?:close|closes|closed|fix|fixes|fixed)\s+#(\d+)", body, re.IGNORECASE)
    issue_ids = [int(num) for num in issue_ids]

    # If no specified issue, create Notion DB item with PR id 
    if not issue_ids:
        print(f"Cannot find related issue numbers in PR #{pr_number}. Add PR id itself on the list.")
        issue_ids = [pr_number]

    for related_issue_number in issue_ids:
        notion_page = find_notion_page_by_github_id(related_issue_number)

        if not notion_page:
            # There is no related issue on Notion or have to add PR itself 
            if related_issue_number == pr_number: # Register PR itself
                print(f"Add PR #{pr_number} on the Notion DB.")
                create_notion_page(f"PR: {pr_title}", "병합 요청됨", pr_assignee_id, pr_url, pr_number)
            else:
                print(f"Issue #{related_issue_number} is not in Notion DB. Create new one.")
                create_notion_page(f"이슈 #{related_issue_number} (PR 연동)", "병합 요청됨", pr_assignee_id, pr_url, related_issue_number)
            continue

        page_id = notion_page["id"]

        if action == "opened" or action == "reopened":
            print(f"PR opened/reopened: #{pr_number} - {pr_title}. Change status of related issue #{related_issue_number}.")
            update_notion_page_status(page_id, "병합 요청됨")
        elif action == "closed":
            if pr.get("merged"):
                print(f"PR merged: #{pr_number} - {pr_title}. Change status of related issue #{related_issue_number}.")
                update_notion_page_status(page_id, "병합됨")
            else:
                print(f"PR closed (not merged): #{pr_number} - {pr_title}. Change status of related issue #{related_issue_number}.")
                update_notion_page_status(page_id, "닫힘")
        else:
            print(f"Not supported PR action: {action}")

if __name__ == "__main__":
    event_payload = get_github_event_payload()

    if not event_payload:
        print("Cannot read event payload. Terminate.")
    else:
        event_name = os.getenv("GITHUB_EVENT_NAME")
        print(f"GitHub Event Name: {event_name}")

        try:
            if event_name == "issues":
                handle_issue_event(event_payload)
            elif event_name == "pull_request" or event_name == "pull_request_target":
                handle_pull_request_event(event_payload)
            else:
                print(f"Not supported GitHub event: {event_name}")
        except requests.exceptions.RequestException as e:
            print(f"Notion API request error: {e}")
            if e.response:
                print(f"Failure response: {e.response.text}")
            exit(1)
        except Exception as e:
            print(f"Unpredicted error occured: {e}")
            exit(1)