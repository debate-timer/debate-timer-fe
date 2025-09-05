import government from '../assets/template_logo/government.png';
import igam from '../assets/template_logo/igam.png';
import kondae_time from '../assets/template_logo/kondae_time.png';
import han_alm from '../assets/template_logo/han_alm.png';
import todallae from '../assets/template_logo/todallae.png';
import jungseonto from '../assets/template_logo/jungseonto.png';
import visual from '../assets/template_logo/visual.png';
import hantomak from '../assets/template_logo/hantomak.png';
import seobangjeongto from '../assets/template_logo/seobangjeongto.png';
import osansi from '../assets/template_logo/osansi.png';
import nogotte from '../assets/template_logo/nogotte.png';
import kogito from '../assets/template_logo/kogito.png';
import { DebateTemplate } from '../type/type';
function createTableShareUrl(encodeData: string): string {
  return `${import.meta.env.VITE_SHARE_BASE_URL}/share?data=${encodeData}`;
}
interface DebateTemplateList {
  ONE: DebateTemplate[];
  TWO: DebateTemplate[];
  THREE: DebateTemplate[];
}
export const DEBATE_TEMPLATE: DebateTemplateList = {
  ONE: [
    {
      title: '산업통상자원부',
      subtitle: '',
      logoSrc: government,
      actions: [
        {
          label: '3vs3 통상토론대회 형식',
          href: createTableShareUrl(
            'eJzFkj9PwkAYh79K884dVAZMN8AOJNKStiwaY45yhcZybXr4L6SJRmGRwUVDTDXV2QEHEr9Tr9%2FBO6pYjIsLbndP7n6%2FJ%2B%2FdENwOKKXtsgwucXxQhkBQH4MCJemESiUpG8%2FZ1WU2TtLnJJ1cZA8TKZvesZtHkGFwHoiTtZZp6Y36nsoR6mLSQRzydRD61MKor%2BWBbPbKrt84t31S5OlsyoM5P0UhcUm3ij0PFAd5FMvguMSlvQKKeC1qe%2Fzi%2FhDoABFbZDQN3eQJNMDY7lm5FnsacWdO2%2F7ZJ9J0o1HZFeauqN7c2siXTRwKIVDIsectkRlgdMSFvjAVexzm20gu1Nd07T%2FrNbVlGYvgHwa3LE7yp1vxsOoN9bBaMdWdpctKcy5TLuh9uyyk%2FziJecxeRlI6i9n9%2B1oG8ut3WIvFQfQBTEMy%2BQ%3D%3D',
          ),
        },
      ],
    },
    {
      title: '이감',
      subtitle: '경희대',
      logoSrc: igam,
      actions: [
        {
          label: '하이브리드 토론',
          href: createTableShareUrl(
            'eJzFkk1LAkEYx7%2BKPOc9%2BAIhe1Pbg5C74q6XImLUUZfW2WXXqBAhIiPIgxCFhzW0Q3TwsEWCn8kZv0OzrZm9kBJkt3l%2BzPyfH88zDdBLIMbiMQF0UjZBbABBNQwisN7zxOuwy15oet3lBR236f2QXrmh6XmfDvogQP3Y8m%2Bm8qqmZNLbEkeogkkJccjPlm06GkY1eRboDdnZI%2BdFkyxy6nVp%2B4TzQ2QTnVSS2DBALCPDwQKUdaI71QXU5G1RweAPdxrg1BEp%2BhnZnKLyBMfCuFjVAi122wo0C%2BbRDMlKLpPY8s11v3UkHg6OWWz7QiCSA8OYI9XCaJ8LvWHHr7HNcyL06QKawoJASpG%2FCExGHeY9sIHHToc%2FakR%2FqRFdSWOtc%2FhuEf8wB1nKa7nX6E%2Bj6DC3P%2F%2B%2F7yZaOiPtJROqtDm3%2BdA70NkIh5fb%2BOXynYxcdtcKUc9lN%2BM%2FmUlspdWsy2O3%2BQJwVp3c',
          ),
        },
      ],
    },
    {
      title: '건대타임',
      subtitle: '건국대',
      logoSrc: kondae_time,
      actions: [
        {
          label: '타임식 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIyMTDWUcrMS8tXsqpWykvMTVWyUnq1ccvrnoa3zQ1v5rW86Z6r8LZtweuFC5R0lEoqC0DyzqHBIf6%2BnlGuQKHE9NS8lESgIJBdUJRfHJKamOsHMebNhjVvWjYCxZPz85DFX2%2BYATQeKF6eWJSXmZfulJqTo2SVlphTnKqjlJaZl1mcAREqKSpNrQXampiUA9QXXa1UXJKYlwwyws81NCTI0QdoRnFBampyRgjEYRCHvlnQAnLym7kzgPJJ%2BRVQST%2F%2FIF%2BwlpJMkDMMLQwgzIDUIpDjlKzySnNy4ELBBamJ2UDHwYSLQfzUIgi3VodYt%2BBzgZGhAZWcEBDkH4xu%2F5t5rQTsNzSikvXO%2Fn4DaT0234PSGAHrqRX%2F2HxPY%2BtjawF7h1Ut',
          ),
        },
      ],
    },
    {
      title: '한앎',
      subtitle: '연합동아리',
      logoSrc: han_alm,
      actions: [
        {
          label: '의화식 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytjTUUcrMS8tXsqpWykvMTVWyUno7dc6bqX1vuucqOLu6OCq8bVvweuECJR2lksoCkLRzaHCIv69nlCtQKDE9NS8lESgIZBcU5ReHpCbm%2BkFMebNhzZuWjUDx5Pw8ZPHXG2a87mkAipcnFuVl5qU7pebkKFmlJeYUp%2BoopWXmZRZnIAnVAq1NTMoBaoyuViouScxLBpkREOQfDDShuCA1NTkjBOKsN%2FNaIc5Myq%2BACvn5B%2Fk6%2BoBcngmy2tDUAMIMSC0COUjJKq80JwcuFFyQmpgNdBBMuBjETy0CmmP4elOHUq0OkgOc%2Ff0wHPBq64Q3G1a8WbjhTdMavM4wItMZRkQ5g67hgC0iaB4OxDmDhuFAXEQMQDjQOT1ghsOApAfiogNU7uAPByNDmiZIujqAziFAXEqguQNiawHVv27d',
          ),
        },
      ],
    },
    {
      title: '토달래',
      subtitle: '성신여대',
      logoSrc: todallae,
      actions: [
        {
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJzVk09LAkEUwL%2FKMuc9WJHU3vyzByF3xV0vRcSooy6ts8uuUSFCBwnBDnYRDyrrJTvsYYICP5MzfYdm2jIF8abSbd7vzbz34zGvCawyUI5OjmVg4YoDlCbAsI6AAj4fA9oN6XjAuiMppaYTkiCTAMigce%2BKG6mCYerZzLnKEawiXIYc8rPrOb6JYF2LCjESsvYb5yUHL3NKBvTpgfNb6GELV5PItoFSgbaPZFCxsOXXllCLt4VFmz%2B8aAK%2FAXFJ1MjldYNX8F2ESjUz0prPCJsQSoasP%2BO5onP3k9D0fDZxJvwtIXAai0455AkroOAb214gw0Xwmlv9Yl%2FEyIvClrzkkNK1vTusncNHj5FXNu2w0WCTw8HhNgexawlNLZj578IrHmz8zIK2xLrDOWlvEolv26PHhsFik%2F40zExWvUomDDW9UFnpHMnEY7F%2FPJN1H4ROOzR8py%2BhtN9t2ZXHZesLlsH%2Fxw%3D%3D',
          ),
        },
      ],
    },
  ],
  TWO: [
    {
      title: '중앙선거방송토론위원회',
      subtitle: '',
      logoSrc: jungseonto,
      actions: [
        {
          label: '열린 토론대회 예선, 본선',
          href: createTableShareUrl(
            'eJzFks9LAkEUx%2F%2BVZc4Sgqf2puZByB%2FoeikiRh1zaRtlV6kQwcMWhoJ1MCXWMgq7GG1k5cFTf87O839otilRAk9hp5n5znvf93kzr4LULJJ9Xp8HqTRXQHIFUXxAkIxYszZtW%2Bxp4rw%2BStAZsYE9Pe2z2757cdWUoFsHs%2F%2Fxzl7GfEUeVDouunnBVFKJRcJbIS7hPUKzmIvcgztBx3bGdQl6XTYcOXYNrk%2BgZ0rT1jk88GJd6AyhPZHcso37NZ5f1AuGQvBBVCCBPQTzmeuZAp3Xmd3lUFw%2FxDpV6V6AaBqSc1gziAflVKoaeSGV9DKpclKc1njedgUZJUwzrkU8EUtyA6NISCaviE5EuWmzJkHDgusLZltwOeZR6cLRd0g0loj4N93mVZdk3St2caK7eEimZU2bSckiwfsc70c23DPRxbHqmaMJxqK%2FaEST%2F0ETDaWUxJfv4vPcTVjLdN6akpiLBRQlHAntBvzJ0MYMZ6G6APJ5vX%2FI07Ac24RRj92cQd9aGc7yz2IPdT7sbDCUVvdhy4d5VUQ71U8AxcEn',
          ),
        },
        {
          label: '열린 토론대회 결승',
          href: createTableShareUrl(
            'eJzFks9LAkEUx%2F%2BVZc4Smh5ib2p7EPIHul6KiFVHXVrHZVepEMHDFpaCdTAlVjMKvRhtYWHgX7Qz%2Fg%2FNtmZKngzqNu877%2Fve5828EhBTgHU7PQ4gonQesCWAhBwELMD1yrSp46eJ%2BfrIkNYI9w1metbDdz3r5qbOmC8GuXgHDlA4kS2DPx7jw8HALkclIQNRSqAiNdMSpGWY4ypDOm08HJlGhXRPSUdjpo1LMqBd2qQ1JM0JY%2FWrPWxQv6zkVR4KuZDNQowh0Z6pnsyjRR0bbQpD9SNBQSLK%2BKAkAbagFKEDpEUkqtlvpUxBhYREbXsloBYElLQqRKLhGPWrMoTJLG8PYneb1isMqemke8VgQyfXY5qWyB%2FPckLhaNC7Yw0vWiSuTad9jEDF4gMsKkrSXIrJUDikfF%2ByasVQscOyY4HHHw794LGn%2FB%2BeEBfno5%2BFl5%2FofoIbmvlWn63EEgsfCHIHPm%2BM257zLHW3gTwLiL%2FnqemmoZFRB9%2Bek56%2BBo5raxWO27X%2BZ%2BFBlW477g%2F%2F8r9W7fM%2FIO2XPwDn1rrY',
          ),
        },
      ],
    },
    {
      title: '통일부',
      subtitle: '',
      logoSrc: government,
      actions: [
        {
          label: '통일토론대회 형식 (예선)',
          href: createTableShareUrl(
            'eJzdk09LAkEYh7%2BKzKlgD6kQtTe1PQi5K%2B56KSJGndWldXbZNSpE6LCKkIe6hITG1qUOHbZA6NAncsfv0ExbsvbPEDLpNvMw83sf3nmnDrQS4OPrMQ5oWDUAXwcYVhHgwag1IP2nyKjl%2Bleu3zkeXXSWSLdNHHcZcKB2ZLJDqbysSJn0lkARLCNcghTStWkZtoJgVQyyiHdHnHvKiwYOc9%2Fr0mTKD6CFNVxOIl0HvAp1G3FA1bBmV0KoQcvCgk4vbteBXYO4yDKyOUmmCbaJULGiBFrkskmlKS0Yh69IlHKZxCYz11jp6NpKsMwiiwkBHu%2Fr%2BhjJJoJ7VOgN22yPLJoT9R%2FaoMGFBFKS%2BLcCopBXci%2FR7xzOiOtEyElv6DnfqazOZsK2UxvBXnhKI2IzNiL2oRGfjcJcBRblJb7wGA5OiXdLbtqk353QUNIZYTeZkIWNscpE5UAmPLL%2FymUhfgoZ9Mh1M%2BJ7PXL%2B%2BCvzGv%2FRh5mXx07jGWqQVcg%3D',
          ),
        },
        {
          label: '통일토론대회 형식 (준결승, 결승)',
          href: createTableShareUrl(
            'eJztk09LAkEYh7%2FKMqeCPaRG1N7SPAi5K%2B56KSJGHXVpnV1co0IED6tIerBDIaWxRVCHDpsgFPSJ3PE7NNuWaH8srKxDp515YH7vs%2B87UwByEnC%2BJR8LZJxSAVcAGGYR4EC%2F0iXte6ZfMe0z066X%2Bsd1pt88JLX2DLko9ToW2b9jGfc7C1iQ39OcY4GYKAnh0FqQIphGOAkppGstp%2BoSglneTSfWNTFuKE%2BoeJjbVpPWonwH5rCM036kKIBLQUVHLEjJWNYzQ6hIy8K4Qg%2BuF4CehzjhZESigkgTdA2hREZytchpmf4GpXF19wnxQjS8vOqYy05p7%2Fycu4ygnCMEOLytKAMkaghuUaFnrDt7lKM5HrtTBUV2SCAg8L8rwAdjUvQx%2BoXDATENhtRaPcsYp7IwmYmz%2FbARzoTHN8KzOGEjvK8a8dZVmKrAVyfh8X7TKN4TMQ1y0mB63QaxrshllbSbIzpSKBzc9C%2BLwZWB0oiA6zTcsH%2Bl6Sj9hbdMui1yXmZsq0WObn%2FiGgPfp570tDw2ig%2BaOaDCs',
          ),
        },
      ],
    },
    {
      title: '비주얼',
      subtitle: '명지대',
      logoSrc: visual,
      actions: [
        {
          label: '2:2 자유토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytjDRUcrMS8tXsqpWykvMTVWyUnq9s%2BXN4j1vpu150z1XwcjKSOHNvAlv5ix427bg9cIFSjpKJZUFIGXOocEh%2Fr6eUa5AocT01LyURKAgkF1QlF8ckpqY6wcx7c2GNW9aNgLFk%2FPzkMVfb5jxuqcBKF6eWJSXmZfulJqTo2SVlphTnKqjlJaZl1mcAREqKSpNrQXampiUA9QXXa1UXJKYlwwyIiDIPxhoQHFBampyRgjEVW%2FmtUJcmZRfARXy8w%2FydfQBOTwTZLOZAYQVkFoEco6SVV5pTg5cKLggNTEb6ByYcDGIn1oE4dbqINnu7O83gLb7uYaGBIHNRXMASlQhnBHi6esa7%2BQY7OoCdwqKzRDHmBkYYHGLoZEByQGxdc6bRa0KrzfMeTNtBz3CA2taoIcjYmsBmUkxug%3D%3D',
          ),
        },
        {
          label: '2:2 CEDA 토론',
          href: createTableShareUrl(
            'eJzllD9PwkAUwL9Kc3MHaIjRbvzpQCItoWXRGHOUAxrLtWkhagiJQzEmOOBCGIqpOujgUAcSTfhE9PwOXqkCKmFRiInb3S937%2F3y7t5rAa0M%2BESMY4GGKwbgWwDDOgI8CF4ccjcm%2FTHpDhmO55i0kEkyr%2BdecOMBFjROzfBUuigrUi67J1AEqwiXIYV0bVqGrSBYF6NgxH8kzhPlqoEXeeAPgsszyo%2BhhTVcTSFdB3wF6jZiQUXDml2LUMNqojbNCks6vbffAnYDYjUMkS9IMg1gmwipNSWyItedyLJknLwjUSrkkruhuBZm3olFqzyyQh3A46auz5BsInhEdT6wHe6RFW3b7EJ2USgqhWncLwJXxHMY0nUnvrPKY%2BuXPNKS%2BK0Kk1GP%2BA8Mub8gw8Eqifj2Gi3%2B31ss%2B5Gbf4ufViPOrVukR1xvNk%2FmHko2JxymkrKQmbl8yhzJJBbqNHeZSv%2F9H7K0T0Yuue0wge%2BS%2FvMm2mXp4NyExEH7DcztU4k%3D',
          ),
        },
      ],
    },
    {
      title: '한토막',
      subtitle: '한양대',
      logoSrc: hantomak,
      actions: [
        {
          label: '반토막 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytjTTUcrMS8tXsqpWykvMTVWyUno7dc7btgWvl3e%2B6Z6r8HrDDAhHAUQtXKCko1RSWQBS5hwaHOLv6xnlChRKTE%2FNS0kECgLZBUX5xSGpibl%2BENPebFjzpmUjUDw5Pw9ZHGjw654GoHh5YlFeZl66U2pOjpJVWmJOcaqOUlpmXmZxBkSopKg0tRZoa2JSDlBfdLVScUliXjLIiIAg%2F2CgAcUFqanJGSEQV72Z1wpxZVJ%2BBVTIzz%2FI19EH5PBMkM2GFgYQZkBqEcg9SlZ5pTk5cKHggtTEbKB7YMLFIH5qEdAcw9ebOpRqdZAc4OzvN%2Fgc8GrrhDcbVrxZuOFN0xqaOMMIwxnYImIAnOHnGhoSBDYaLUYmvJmzAJ58ES4J8fR1jXdyDHZ1gbsGxW6Ic8yNDLC4xtIAyS0gXYQTxtY5bxa1AjPUnDfTduANESMyQ8SYqIihlztiawHvP5m7',
          ),
        },
        {
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytjTXUcrMS8tXsqpWykvMTVWyUno7dc7btgWvl3e%2B6Z6r4Ozq4qgA4i5coKSjVFJZAFLhHBoc4u%2FrGeUKFEpMT81LSQQKAtkFRfnFIamJuX4Qg95sWPOmZSNQPDk%2FD1n89YYZr3sagOLliUV5mXnpTqk5OUpWaYk5xak6SmmZeZnFGRChkqLS1FqgrYlJOUB90dVKxSWJeckgIwKC%2FIOBBhQXpKYmZ4RAXPVmXivElUn5FVAhP%2F8gX0cfkMMzQTYbmRhAmAGpRSD3KFnllebkwIWCC1ITs4HugQkXg%2FipRUBzDF9v6lCq1UFygLO%2FH4YDXm2d8GbDijcLN7xpWoPPGYYWZDrDiChn0DUcsEUEzcOBOGfQMByIi4gBCAc6pwfMcBiQ9EBcdICKHfzhQOMESVcH0DkEiEsJNHdAbC0Axtlw5w%3D%3D',
          ),
        },
      ],
    },
    {
      title: '서방정토',
      subtitle: '서강대',
      logoSrc: seobangjeongto,
      actions: [
        {
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJzFlMFLwlAcx%2F%2BV8TvvkHrJ3cw8BLmJzkvR4alPHc23sSkVIkTMCOxQh6LDitmpwMMKhP4m9%2Fofeq9ZSAYOYfP2e1%2Fevu%2FD9%2FtjfdAaIGWyWRE00jRA6gNBHQwSUMcN%2FFfq3X1eenT0KOQLuzmBzcHYAxG6Zya%2FlK9WVKW4d1BgEmph0kBMZLNpGbaKUUeee%2FkT6rwxvW6QRT3wH4Lrc6afIItopLWDdR2kJtJtLEJTI5rdDqWu1cMD9iqq6ey7wz7YXUTq3KJUVirMwDYxrrfVkIo%2BDUPKmnE6l2SlXMztc3CNv5xKb4VjCVucByTS0%2FVfqWJidMx4fmSbn7HFfFLB%2BxUMxAWAvCIvAcymN9R%2FEejYpxeTWDjSkTgSDeK%2FJuIPIhpHjEFEa2ITQSS8EctBbGYjljnkQlUtf1v%2FyeKWeo5AR%2B7Md%2BJA4ceVjfB%2F4IpGttdMIhOpkUQB1kwg3p3cOACduvR5KAS%2BS%2B8%2FYuGI1kRSHEeDL6cNB4E%3D',
          ),
        },
        {
          label: '국회의장배 토론',
          href: createTableShareUrl(
            'eJzNkkFLAkEUx7%2FKMuc9rOah9qa2ByF3RbdLETHqqEvr7LKrVIgQsUWgBzsEEirrISgwmAS%2FlDt%2Bh2Zd2ywlJJC6zfyY%2Bb8f770G0IpAjAkCDzRcMoDYABhWERABdXoeeaHuw%2BzWpa0%2BN528zh7btN%2BlgyePEI5hb%2BgCHtQuTf998jCnKunUkcQQLCNchAyys2kZtopgVV7EkhF13hgvGHiZe6Trta8YP4cW1nA5gXQdiCWo24gHJQ1rdiVANauOmqwqzOvs33ED2DWIC35EJqvkWIBtIlSoqIEVHdwElnnjYoFkJZuOH%2Fjiml85EhWCYwZZvg8QcV3XQ5QzETxjPh%2FY9u%2FIYjkRb3wHmvySQFKR%2F5%2FAdNKh5JmjQ0KvR1vxiK54rJvEX3jI0qGanUd%2Fm0mH9txwgT9N1FRaOk3Ec9J%2BaPOldqAT2xXW2My1Qxn%2F22Yq99R1ONrqTYnzU1f2fteUFY%2B1oxmTbe3ozmY7um2Bk%2BY7y2LI5w%3D%3D',
          ),
        },
      ],
    },
  ],
  THREE: [
    {
      title: '오산시',
      subtitle: '',
      logoSrc: osansi,
      actions: [
        {
          label: '오산시 토론 - 초등부',
          href: createTableShareUrl(
            'eJyrVspMUbIy0FHKzEvLV7KqVspLzE1VslJ6M2PJm6YNb7rnKLxtW%2FB64QIFXYU3WzpeT974eluDko5SYnpqXkoiUB2QXZ5YlJeZl%2B6UmpOjZJWWmFOcqqOUlpmXWZyBIlRQlF8ckpqY6we1YMOaNy0bgdqT8%2FOQxV9vmPG6p0GpVkepJDEpBygSXa1UXJKYlwySDAjyDwZqKS5ITU3OCKksABu0afXrTR1vlu9QgBip8HrDnDfTdgCVJeVXQNX4%2BQf5OvoAhUoyQZYYmRhAmAGpRSCrlazySnNy4ELBBamJ2UAfwYSLQfzUIgi3VgfJPX6uoSFBYINRnTRv4psFLQrA0Hu1oQWfQ8zIc4eSEoornP39CIfKm%2B41r9fgDRVDi6EdKhjuwB8ukIQ2AlILhjvw5yJouIzA9IItXF5PnDDSShei8hFGuIzA9II%2FXEbLF7zhMgLTC9Zyt2XHaPmCrZ6Ghwt98lFsLQBY%2BCHr',
          ),
        },
        {
          label: '오산시 토론 - 중등부',
          href: createTableShareUrl(
            'eJztVTFLw0AY%2FSvhmyNUC1KyaXEQbFLadFEcru21DaaXkFRUSkEkiFAHiyAdikQsONgh7SAd%2FEXe%2BR%2B8M7FUDHERl3S7e%2Fnu3cvjfd91waiDspHLymCQhgVKFwhqY1CADcfsImD9kfR%2B6dMHX1qT2HhAb6f05Rxk6JzZoipfKetaYXd%2Fh0OoiUkdcTA6wB5fmT%2FiH2zHcnWM2mrEHEyYN%2BV4zSLLOA2G9FpwnyCHGKS5jU0TlAYyXSxDwyCG21qCelwDqpr84EEX3A4iNcFRLGllzuDaGNdaeqiRzZ7p7Io9zaXwZokGI3Y352VV6zSqUbVSYWtP%2FJchtGQzmXBZxI5QCAo5Ns0FVLYxOuIKv2BX7LETbnvykh51p6KXPom%2FS7ofMN%2BTuLtvgZckZPOPdOQ19XdfWH9CJ4m%2BrOdS5UuYyDTmJbmPIl9SmJc4X%2BjgZjVfYvrohy8pzEuyL6v5kuhLCvMSO3e9%2BWq%2BxL3TC1%2F%2Bp48Oex87ajH7',
          ),
        },
        {
          label: '오산시 토론 - 고등부',
          href: createTableShareUrl(
            'eJyrVspMUbIysjDRUcrMS8tXsqpWykvMTVWyUnozY8mbpg1vuucovG1b8HrhAgVdhVebF7yevPH1tgYlHaWSygKQKufQ4BB%2FX88oV6BQYnpqXkoiUBCq4c3iPW8WzAFKFBTlF4ekJub6QU3esOZNy0ageHJ%2BHrL46w0zXveAzC5PLMrLzEt3Ss3JUbJKS8wpTtVRSsvMyyzOQBKqBbohMSkHqDG6Wqm4JDEvGWRGQJB%2FMNCE4oLU1OSMEIgb32xa%2FXpTx5vlOxQgNiu83jDnzbQdQGVJ%2BRVQNX7%2BQb6OPiB%2FZYLcYmxmAGEGpBaBXKhklVeakwMXCi5ITcwGuhAmXAzipxZBuLU6SO7xcw0NCQIbjOqkeRPfLGhRAIbuqw0t%2BBxCLXc4%2B%2FsRDpc33Wter8EbLoYWIypcIClyJKYX%2FPkIGi4jML1gC5fXEyeMli9Y8hFGuIzA9II%2FXEbLF7zhMgLTC9Zyt2XHaPmCrZ6Ghwt98lFsLQAnZTI8',
          ),
        },
      ],
    },
    {
      title: '노곧떼',
      subtitle: '한국외대',
      logoSrc: nogotte,
      actions: [
        {
          label: '자유토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytrDQUcrMS8tXsqpWykvMTVWyUnrduuPV5s2vp%2B150z1X4c28CW%2FmLHjbtuD1wgVKOkollQUgJc6hwSH%2Bvp5RrkChxPTUvJREoCCQXVCUXxySmpjrBzHpzYY1b1o2AsWT8%2FOQxV9vmPG6pwEoXp5YlJeZl%2B6UmpOjZJWWmFOcqqOUlpmXWZyBJFQLtDYxKQeoMbpaqbgkMS8ZZEZAkH8w0ITigtTU5IwQiLPezGuFODMpvwIq5Ocf5OvoA3J5JshqMwMIKyC1COQeJau80pwcuFBwQWpiNtA9MOFiED%2B1CMKt1UGy3dnfbwBt93MNDQkCm4vmAJS4wukMQyMDKjkEWyS82rRhACOBtrbH1gIA5Ksorg%3D%3D',
          ),
        },
        {
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytrDUUcrMS8tXsqpWykvMTVWyUnrduuPV5s2vp%2B150z1XwdnVxVHhbduC1wsXKOkolVQWgFQ4hwaH%2BPt6RrkChRLTU%2FNSEoGCQHZBUX5xSGpirh%2FEoDcb1rxp2QgUT87PQxZ%2FvWHG654GoHh5YlFeZl66U2pOjpJVWmJOcaqOUlpmXmZxBpJQLdDaxKQcoMboaqXiksS8ZJAZAUH%2BwUATigtSU5MzQiDOejOvFeLMpPwKqJCff5Cvow%2FI5Zkgqw2NDCDMgNQikIOUrPJKc3LgQsEFqYnZQAfBhItB%2FNQioDmGrzd1KNXqIDnA2d8PwwFvZ059M3fHm%2BUdr9fswOcMMzJdYUSUK%2BgaDNjigf7BgM0VoFRGo2AwHhSpgbg0SddgGIjUgBkMfq6hIUFgk9HyxYQ3cxbAyzKcDrEk0yUgLnHumPhmQYvCm%2B45rza00CJiMBxC5%2BxBXDFFVwdgrS62znmzqFXh9YY5b6bhTZk0Lifo5Y7YWgA%2FKNwf',
          ),
        },
        {
          label: '의회식 토론',
          href: createTableShareUrl(
            'eJzN001LAkEYB%2FCvInNeyFUI25uWByFXcddLETHqqEvrKK5RIYKERqAHgxIJlbVTBw9bYnjoE%2B2O36EZt3whKRHMbjN%2FZp%2F58ew8RaAkgODec3JAwcksEIoAwwwCArCqI3MwsJrvpNZxkE5r%2FFhnq%2FGNbvV0wIHCVY4d249KcigYOPLTCKYQTkAa0nUun9VkBDOiXY0YfVJ5oXk8i%2Bdzy2hZ9TLNL2AeKzjlQ6oKhCRUNcSBpIIVLT0Xlei1MKbSD4%2BLQCtAHGc1wpGQRCtoOYTiadlmkW7VZsayl5%2BRGIoEvYdMrrCreZfTXoZRnoGAgM9VdRpJOQTPKOgr1tge5Wkd3nq9BSVuDrAfErcLWNqBt3vTKNsMzsH6bDxshONarR%2Fb44j%2BqByZlF4Q8QI%2Fe80zhxwI%2Bk99Xsl%2FMLUs3GxjeI%2FzdwvbriIh3QZp62tb3LvLLJMGrkG5I3rFQWpt06hs4v98gyx7LOawQYxn0jPIdf9HhGejI%2FRPGGTYJk9VOjNt0hxtZmZ23KsN8Z9JTkofiV5mow%3D%3D',
          ),
        },
      ],
    },
    {
      title: '코기토',
      subtitle: '고려대',
      logoSrc: kogito,
      actions: [
        {
          label: '2:2 일반토론대회 형식',
          href: createTableShareUrl(
            'eJzFkjFPwkAYhv9Kc3MHIAzaDbADibSElkVjzAEHNJZr00LUEBIHcJFEB0Vi0KAmTg41UcOgf4ge%2F8HvLBLALiYGtrunufd78vZrIqOEpHgkLiKDli0kNRHFNYIkxD4vxyNvcjpkZ7dCTIoJ7PrVf%2BLAvx%2F63ZPJTVeY9K%2FgKxJR%2Fdjmb1J5TVcz6R0ZEK4QWsIA4Ww7lqsTXFOm0d4za78AL1p0nvteH4KBH2KHGrSSJKaJpDI2XSKiskENtxqgutMgLZiKCya8220it45pkUdkc6oGAa5NSLGqB1bsrgPKQAvW0RQpai6T2ObiBp%2B8GQlOWeJwHSTRhmnOkGYTfAA6P9jld%2BIE15Y4Nz2lKmucrsh5PfeduyRwwQbD4L8taOjpjLyfTGjy1kxlYXIgE49FQlyinP6xiMcP%2F7w9foe1%2Be2yVEl04586Cd2HdYiENvI2YA8dwfcGrDdaxYaEtrEKib3WF4vqn1s%3D',
          ),
        },
        {
          label: '3:3 통일토론대회 형식',
          href: createTableShareUrl(
            'eJztlU9LAkEYxr%2FKMmcP9pfaW4mHIF3R9VJ0GHXUpXV22VUqRPCgEihUUCGhYXWoQ4eN2PBgX2h39jv0rmshIdLFXQ%2FdZn7DvM%2FDMy%2FvVJGUQ%2Fx6eCOEJJpXEF9FFJcI4hH7vLaGhtMasHafW%2BPXOKdlsv4IgP0wsDt1567DOd0bOEUhVD5T3TuRdEoUYnsHUUC4QGgOA4S1qim6SHApPiltvLLGG%2FCsQqe5bXShMPATrFGJFnaJLCM%2Bj2WdhFBeopJe9FBZq5AaqOKMDPcOq0gvY5p1SySSQgoK6Coh2aLouWL3TbAMNKOcTlBcSMZ29l3jkqu8shr2lgmiuX4QTyuy%2FINSKsHH4Ocb6%2B6eaN62FpqSjwjxIOXj0bSYHBf%2B5eCKDRoca%2FcsozHPyOYCY7DMS2a8sOdz1u%2F6EsasVrDbpv1enye%2FvUB13yOY9Q7%2BRbAs3TizEWDUBDgTfJRf5ldgTyP7omF9wE8y%2FlbmBrK1yBkdhJH%2FRP5kxOyxxyZnGz12Owzs4%2FDHxVHtCye%2Bd2A%3D',
          ),
        },
        {
          label: '3:3 통상토론대회 형식',
          href: createTableShareUrl(
            'eJyrVspMUbIyMTDTUcrMS8tXsqpWykvMTVWyUnqzd8qrHRveti140z1XwdjKWOFt29Y3zY1AgdcLF7zuaXg7q0fh7YypQFklHaWSygKQHufQ4BB%2FX88oV6BQYnpqXkoiUBDILijKLw5JTcz1gxq9Yc2blo1A8eT8PGTx1xtmAA0GipcnFuVl5qU7pebkKFmlJeYUp%2BoopWXmZRZnQIRKikpTa4G2JiblAPVFVysVlyTmJYOMCAjyDwYaUFyQmpqcEQJx1Zt5rUAnA0WT8iugQn7%2BQb6OPiCHZ4JsNjQygDADUotA7lGyyivNyYELBRekJmYD3QMTLgbxU4sg3FodJOud%2Ff0G0no%2F19CQILDBaC6Y8GbOAkjMobgjxNPXNd7JMdjVBe4WFJshjjFHch7CLWBHkxYSrzZtoFdIYEsHNLY%2BthYAnmMxuw%3D%3D',
          ),
        },
      ],
    },
  ],
};
