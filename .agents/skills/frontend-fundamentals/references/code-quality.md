# 코드 품질 (Code Quality) 상세 가이드

출처: https://frontend-fundamentals.com/code-quality/

## 핵심 원칙

좋은 프론트엔드 코드 = **변경하기 쉬운 코드**. 새 요구사항을 구현할 때 기존 코드를 수정하고 배포하기 수월한 코드가 좋은 코드다. 4가지 기준으로 판단한다.

---

## 1. 가독성 (Readability)

코드가 읽기 쉬운 정도. 변경하려면 먼저 코드가 어떤 동작을 하는지 이해할 수 있어야 한다. 읽기 좋은 코드는 한 번에 고려하는 맥락이 적고, 위에서 아래로 자연스럽게 이어진다.

### 1-1. 맥락 줄이기

#### A. 같이 실행되지 않는 코드 분리하기

동시에 실행되지 않는 코드가 하나의 함수/컴포넌트에 있으면 동작 파악이 어렵다.

**Before** - 권한에 따른 분기가 섞여 있음:
```tsx
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  useEffect(() => {
    if (isViewer) return;
    showButtonAnimation();
  }, [isViewer]);
  return isViewer ? (
    <TextButton disabled>Submit</TextButton>
  ) : (
    <Button type="submit">Submit</Button>
  );
}
```

**After** - 권한별로 컴포넌트 분리:
```tsx
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}
function ViewerSubmitButton() {
  return <TextButton disabled>Submit</TextButton>;
}
function AdminSubmitButton() {
  useEffect(() => { showButtonAnimation(); }, []);
  return <Button type="submit">Submit</Button>;
}
```

**효과**: 분기가 단 하나로 합쳐지고, 각 컴포넌트에서 고려할 맥락이 줄어든다.

#### B. 구현 상세 추상화하기

한 사람이 동시에 고려할 수 있는 맥락의 수는 제한되어 있다(약 6~7개). 불필요한 구현 세부사항을 추상화하면 가독성이 올라간다.

**Before** - 로그인 체크 로직이 그대로 노출:
```tsx
function LoginStartPage() {
  useCheckLogin({
    onChecked: (status) => {
      if (status === "LOGGED_IN") {
        location.href = "/home";
      }
    }
  });
  return <>{/* 로그인 관련 컴포넌트 */}</>;
}
```

**After** - AuthGuard Wrapper 컴포넌트로 분리:
```tsx
function App() {
  return (
    <AuthGuard>
      <LoginStartPage />
    </AuthGuard>
  );
}
function AuthGuard({ children }) {
  const status = useCheckLoginStatus();
  useEffect(() => {
    if (status === "LOGGED_IN") location.href = "/home";
  }, [status]);
  return status !== "LOGGED_IN" ? children : null;
}
```

**추상화의 비유**: "왼쪽으로 10걸음 걸어라"는 적절히 추상화된 문장이다. 이를 추상화 없이 표현하면 "북쪽을 바라보았을 때 한 번의 회전을 360등분한 각의 90배만큼..." 이 되어 이해하기 어렵다. 코드도 마찬가지다.

#### C. 로직 종류에 따라 합쳐진 함수 쪼개기

쿼리 파라미터, 상태, API 호출과 같은 로직의 종류에 따라서 함수나 Hook을 만들지 마라. 한 번에 다루는 맥락이 많아져 이해하기 어려워진다.

**Before** - 모든 쿼리 파라미터를 하나의 Hook으로:
```ts
export function usePageState() {
  const [query, setQuery] = useQueryParams({
    cardId: NumberParam,
    statementId: NumberParam,
    dateFrom: DateParam,
    dateTo: DateParam,
    statusList: ArrayParam
  });
  return useMemo(() => ({
    values: { cardId: query.cardId ?? undefined, ... },
    controls: { setCardId: (id) => setQuery({ cardId: id }, "replaceIn"), ... }
  }), [query, setQuery]);
}
```

**문제점**:
- Hook이 담당할 책임이 무제한 확장됨
- 어떤 쿼리 파라미터가 바뀌어도 전체 리렌더링 발생
- `cardId`만 쓰는 컴포넌트도 `dateFrom` 변경 시 리렌더링

**After** - 개별 쿼리 파라미터별 Hook:
```ts
export function useCardIdQueryParam() {
  const [cardId, _setCardId] = useQueryParam("cardId", NumberParam);
  const setCardId = useCallback((id: number) => {
    _setCardId({ cardId: id }, "replaceIn");
  }, []);
  return [cardId ?? undefined, setCardId] as const;
}
```

**효과**: 명확한 이름, 좁은 영향 범위, 필요한 것만 리렌더링

### 1-2. 이름 붙이기

#### A. 복잡한 조건에 이름 붙이기

**Before**:
```tsx
if (user.age >= 18 && user.hasConsented && !user.isBlocked) { ... }
```

**After**:
```tsx
const canAccess = user.age >= 18 && user.hasConsented && !user.isBlocked;
if (canAccess) { ... }
```

#### B. 매직 넘버에 이름 붙이기

의미를 알 수 없는 숫자에 설명적인 이름을 부여한다.

**Before**:
```tsx
if (scrollY > 640) { ... }
```

**After**:
```tsx
const HEADER_HEIGHT = 640;
if (scrollY > HEADER_HEIGHT) { ... }
```

### 1-3. 위에서 아래로 읽히게 하기

#### A. 시점 이동 줄이기

코드를 읽을 때 위아래로 왔다 갔다 하는 시점 이동을 줄인다. 함수를 사용하는 곳 가까이에 정의하거나, 인라인으로 작성한다.

#### B. 삼항 연산자 단순하게 하기

삼항 연산자가 중첩되면 가독성이 크게 떨어진다. 중첩 삼항 대신 early return이나 별도 변수를 사용한다.

#### C. 왼쪽에서 오른쪽으로 읽히게 하기

비교 연산에서 변수를 왼쪽, 상수를 오른쪽에 둔다.

**Before**: `if ("ACTIVE" === status)`
**After**: `if (status === "ACTIVE")`

---

## 2. 예측 가능성 (Predictability)

함수나 컴포넌트의 동작을 동료들이 얼마나 예측할 수 있는지. 이름과 파라미터, 반환값만 보고 동작을 알 수 있어야 한다.

### A. 이름 겹치지 않게 관리하기

프로젝트 내에서 같은 이름의 함수/변수가 다른 동작을 하면 혼란을 준다. 예: 자체 `http` 유틸과 라이브러리의 `http` 객체가 동시에 존재하면 혼동 발생.

### B. 같은 종류의 함수는 반환 타입 통일하기

비슷한 역할의 함수(예: `useUser`, `useAdmin`)가 서로 다른 반환 구조를 가지면 예측이 어렵다. 일관된 반환 타입을 유지한다.

### C. 숨은 로직 드러내기

함수 이름/파라미터/반환 타입으로 예측할 수 없는 부수 효과(side effect)는 분리한다.

**Before** - fetch 안에 로깅이 숨어있음:
```ts
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>("...");
  logging.log("balance_fetched"); // 숨은 부수 효과
  return balance;
}
```

**After** - 순수하게 fetch만 하고, 로깅은 호출부에서:
```ts
async function fetchBalance(): Promise<number> {
  return await http.get<number>("...");
}
// 호출부
const balance = await fetchBalance();
logging.log("balance_fetched");
```

---

## 3. 응집도 (Cohesion)

수정되어야 할 코드가 항상 같이 수정되는지. 응집도가 높으면 한 부분 수정 시 다른 부분에서 의도치 않은 오류가 발생하지 않는다.

> **가독성과 응집도는 상충할 수 있다**. 응집도를 높이려면 추상화가 필요한데, 이는 가독성을 떨어뜨릴 수 있다. 함께 수정하지 않으면 오류가 발생할 수 있는 경우엔 응집도를 우선한다.

### A. 함께 수정되는 파일을 같은 디렉토리에 두기

기능 단위로 파일을 모아두면, 수정할 때 관련 파일을 빠르게 찾을 수 있다.

### B. 매직 넘버 없애기 (응집도 관점)

여러 곳에서 동일한 상수를 사용할 때, 한 곳을 수정하면 다른 곳도 반드시 수정해야 하므로 상수로 추출하여 응집도를 높인다.

### C. 폼의 응집도 생각하기

폼 관리 시 2가지 응집도 전략이 있다:

**1) 필드 단위 응집도** - 각 필드가 독립적으로 검증 로직을 가짐:
```tsx
<input {...register("email", {
  validate: (value) => {
    if (isEmptyStringOrNil(value)) return "이메일을 입력해주세요.";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
      return "유효한 이메일 주소를 입력해주세요.";
    return "";
  }
})} />
```
- 선택 시점: 독립적 검증 필요, 재사용 필요, 비동기 검증 필요

**2) 폼 전체 단위 응집도** - Zod 등 스키마로 중앙 관리:
```tsx
const schema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z.string().min(1, "이메일을 입력해주세요.").email("유효한 이메일 주소를 입력해주세요.")
});
// useForm({ resolver: zodResolver(schema) })
```
- 선택 시점: 단일 기능 구성, 단계별 입력(Wizard), 필드 간 의존성 있을 때

---

## 4. 결합도 (Coupling)

코드 수정 시 영향범위가 어느 정도인지. 영향범위가 적어야 변경 시 예측 가능하다.

### A. 책임을 하나씩 관리하기

하나의 훅/함수가 여러 가지 책임을 가지면 하나를 수정할 때 다른 책임에도 영향이 간다. 단일 책임 원칙을 적용한다.

### B. 중복 코드 허용하기

무분별한 공통화는 결합도를 높인다. 두 코드가 우연히 비슷할 뿐 서로 다른 이유로 변경된다면, 중복을 허용하는 것이 낫다.

### C. Props Drilling 지우기

Props가 여러 단계를 거쳐 전달되면 중간 컴포넌트들이 불필요하게 결합된다.

**Before** - Props Drilling 발생:
```tsx
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  const [keyword, setKeyword] = useState("");
  return (
    <Modal open={open} onClose={onClose}>
      <ItemEditBody
        items={items} keyword={keyword} onKeywordChange={setKeyword}
        recommendedItems={recommendedItems} onConfirm={onConfirm} onClose={onClose}
      />
    </Modal>
  );
}
```

**해결 방법 A: 조합(Composition) 패턴**
```tsx
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  const [keyword, setKeyword] = useState("");
  return (
    <Modal open={open} onClose={onClose}>
      <ItemEditBody keyword={keyword} onKeywordChange={setKeyword} onClose={onClose}>
        <ItemEditList keyword={keyword} items={items}
          recommendedItems={recommendedItems} onConfirm={onConfirm} />
      </ItemEditBody>
    </Modal>
  );
}
function ItemEditBody({ children, keyword, onKeywordChange, onClose }) {
  return (
    <>
      <Input value={keyword} onChange={(e) => onKeywordChange(e.target.value)} />
      <Button onClick={onClose}>닫기</Button>
      {children}
    </>
  );
}
```

**해결 방법 B: Context API**
- Composition으로 해결되지 않을 때 최후의 수단으로 사용
- 먼저 `children` prop으로 depth를 줄일 수 있는지 확인
- 컴포넌트의 역할과 의도를 나타내는 props라면 drilling이어도 괜찮을 수 있음

---

## 트레이드오프 이해하기

4가지 기준을 모두 동시에 충족하기는 어렵다:

| 시도 | 장점 | 단점 |
|------|------|------|
| 공통화/추상화 | 응집도 ↑ | 가독성 ↓ |
| 중복 허용 | 결합도 ↓ | 응집도 ↓ |
| 인라인 작성 | 가독성 ↑ | 응집도 ↓ |
| 단일 책임 분리 | 결합도 ↓ | 파일 수 ↑ |

**핵심**: 현재 상황을 바탕으로 어떤 가치를 우선할지 깊이 고민하라.
