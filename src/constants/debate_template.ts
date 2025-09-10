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
            'eJyrVspMUbIytjDXUcrMS8tXsqpWykvMTVWyUjJWKCtWMFZ427b1TXPj27YFrxcueN3T8HZWj8LbGVPfdM9V0lEqqSwAqXQODQ7x9%2FWMcgUKJaan5qUkAgWB7IKi%2FOKQ1MRcP4iBbzasedOyESienJ%2BHLP56wwygwUDx8sSivMy8dKfUnBwlq7TEnOJUHaW0zLzM4gwkoVqgtYlJOUCN0dVKxSWJeckgMwKC%2FIOBJhQXpKYmZ4RAnPVmXivQzUDRpPwKqJCff5Cvow%2FI5Zkgqw2NDICyYLPzSnNyIMIBqUUgx6EJBRekJmYDHQcTLgbxU4sg3FodJKc4%2B%2FsNFqf4uYaGBIEtQXPNhDdzFkCiFMVNIZ6%2BrvFOjsGuLnB3QazA6TBzkLMx3AX2DIkhtHXOm0WtCq83zHkzbQfdAwpr8qG7i2JrAbdLRw0%3D',
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
            'eJzVk09PwjAYh7%2BKec87DPRgdhOciYlsZIyLhpgyOlgc3bI%2FUbMsIXF60Q%2FABTLuHiDxU0n5Dr5lSIwh4m16a5%2B3%2FfV5mzYBpwfKkXwogcNsD5QEGBlSUOB98bZ8Ga0eRnya8efJweopX85ykCC690W93m6ZeuP8UkVE%2BpT1CEIc%2B4EXmpQMtSKGz195tkBueewrX87HGI%2F8lgTMYf0adV1QbOKGVALbYU44KFAUxDTFU0nXxX1XCYQRYZaI0NS2aZxcYEboU2oNzEKsEOV5JpT5ZIz1rne3KWq60VhviRyhUTmWsbo%2BB5M3ndXUM91Qr1XtdLtOFv4xi0Cppp0CNmkg2gGFxa67RS2fkhts5xOHYk6DYppKv7X%2FyblakUuTbhp667sxnz7uMa5USxOu69r%2FEt51w%2BKv7BEu7x3vuuE%2FJ9xJPwDCra7l',
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
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytjTUUcrMS8tXsqpWykvMTVWyUno7dc6bqX1vuucqOLu6OCq8bVvweuECJR2lksoCkLRzaHCIv69nlCtQKDE9NS8lESgIZBcU5ReHpCbm%2BkFMebNhzZuWjUDx5Pw8ZPHXG2a87mkAipcnFuVl5qU7pebkKFmlJeYUp%2BoopWXmZRZnIAnVAq1NTMoBaoyuViouScxLBpkREOQfDDShuCA1NTkjBOKsN%2FNaIc5Myq%2BACvn5B%2Fk6%2BoBcngmy2tDUACgLNjuvNCcHIhyQWgRyHJpQcEFqYjbQcTDhYhA%2FtQhopuHrTR1KtTpIjnH298NwzKutE95sWPFm4YY3TWvwOsmICk4yIspJAxY%2B2CKLruFDnJPoFD7ERdYAh88Aph%2FM8Bnw9ENclIHKNfzhY2RIt8Q8YI4ZwJAhLuXQ1TGxtQBiH58N',
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
            'eJzdkz9PwkAUwL9Kc3MH1Ei0G386kEhLaFk0xhxwQGO5Ni1GDSFxIIYEB1wMA5CyiEOHM9GEz8Sd38E7qogGGYW43fu9u%2Fd%2BebnXBFYZKHsH%2BzKwcMUBShNgWEdAAW%2B3Ae2GdNRn3aGUUtMJSZBxAGTQuHbFjVTBMPVs5ljlCFYRLkMO%2Bdn1HN9EsK5FhRgJWfuZ85KDlzklfXp3w%2Fkl9LCFq0lk20CpQNtHMqhY2PJrS6jF28KizR%2BeNIHfgLgkauTyusEr%2BC5CpZoZac2mhI0JJQP2MOW5onP1kdD0fDZxJPwtIXAY48l5A3xh2xHNIU8Y%2FkCGi%2BA5N%2FzEvoiRF4UtecknpWtb5bNyPq89Rp7YpMOG%2FXU%2BO7t%2FNaBNCmlqwczPm3xzYqN7FrQl1h3MSHudVPwvnXpsECy28EvJzGTVs2TCUNMLrajFr2LxWOyfzGrVh6KTDg1f6GMobc%2FWbcLptPUOQLEj%2Bg%3D%3D',
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
            'eJzVk09LG0EYxr%2FKMudQtoYeujejKwjNriTrRREZ40SXrpOwm1BLCOSwSiQB9WATykZTWvSS0i1N2xxy6sfZefMd%2Bo6j1iB4KAp6GuaZ98%2FvmXemRtxNYqT1dIq4vFgiRo1wusOIQUS7MTmJxLdx8vOrBp2hOI8n%2B33xqS8PPrY16DYh7P%2F5LX6McCUpUnlflnlzy3nHzi6umCjRLcY3KYpYAytBJ05GTQ16XTEYJnEDTvegF2qTwyO4wGZd6AzgZKzJtq0vLzC%2F7JcCh9EdSyFBPIDwO%2BqFEr%2Bti7iLUKi%2Foz53%2BVaGeR4xitQLWIoUXe4G20qq%2BFVWR1K64WHeao0EFcoLssRSzs5jgaDMWGHbUU5Uu0m7oUErgtNjEUfwYYRRG6XdqxDLzmVn30jzriR5rePhZSesfXUfGXPBzpnrpjV%2FE6ZLB1VeIcZMfU2JS8yXhojBq553I%2BXLjL5FQ9dyIPfMV9t66hb%2FnG3d4VfX8jz4LXPZyV2STI%2Fg81gchsmvtqbe3hS8s5g11zOzefMfmWqjLEyRKLi0rj8gWytK4hCGPXF2AP3oUdBevtL%2Ff%2Brioon%2FTJwPtKc8%2Bft%2F3tP1sFb%2FC67gA%2Bk%3D',
          ),
        },
        {
          label: '열린 토론대회 결승',
          href: createTableShareUrl(
            'eJzdU0FLAkEY%2FSvLnCU0O8TesjYQcjd0uxQRm021tI2yq1SI4MGiUqgOpcRqRlEXoy0sCvxFO%2BN%2F6JvGNCk6VCeP8%2BZ733vvm29yyFxBcjg4FkAmWU0hOYeIsYmRjGi50Dl16X3bf7qTWKVFbzyps9eglw1%2Bc16W%2FEePHb6iAMrspDlhci6ha7HovAKQsYbJigEgkKEFq3j%2By77EalXabPlegdV3Wa0odY6O2S2oVFmlyU7bEtcrXY8AP22nHB0bm6rwwrwmKz4AnkyRzzj1qmAG8C3DJiZZi2DLQnLGzuIAWjWJ6az3kTwYNZYtoC3kkJMxSJJ3mI1rCeA7aYyT67oIItQ65YLESi6rn0jUc9nZC5Qtp7a7NaoWj03M8PAmdxIaDcLtuxZ07w4kokxrcWVJUad6deEgz5AlGaDkAz9V9gtH84sCnMU2z45kkrWsHpRIY2MDsn%2FADj9jWxy5Ri%2FrpKZ%2BySomOHxZVWVOj7%2BbHnzaqzY9KvrP5e4qD%2BTUozFlKTKRUPrOhIwIO%2BBEmBvjo%2Fg3byXX94qsVaMXB6zh%2FtFaaPw7a%2BHQ7xeE3u7D76U3zWHZke%2F%2B%2FpDFXcy%2FAdHZMAM%3D',
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
            'eJyrVspMUbIytjTSUcrMS8tXsqpWykvMTVWyUnrbtvXN3D0Kb9sWvF644HVPw9tZPRpvZnS8aVmgqaSjVFJZAFLkHBoc4u%2FrGeUKFEpMT81LSQQKAtkFRfnFIamJuX4Qs95sWPOmZSNQPDk%2FD1n89YYZQJOB4uWJRXmZeelOqTk5SlZpiTnFqTpKaZl5mcUZSEK1QGsTk3KAGqOrlYpLEvOSQWYEBPkHA00oLkhNTc4IgTjrzbxWoKOBokn5FVAhP%2F8gX0cfkMszQVYbWhgAZcFm55Xm5ECEA1KLQI5DEwouSE3MBjoOJlwM4qcWAc00fL2pQ6lWB8kxzv5%2Bg8cxfq6hIUFga9DcM%2FHNghaFN91zXm1owecsM8pdBeISDCBQKiAQQEZUCCAjjADClnQGzDGDMbZwuOnV1glvNqx4s7zjzdwZKE4K8fR1jXdyDHZ1gTsLYgVOh4GT%2FnB316DLcW%2B2znmzqFXh9YY5b6btoHlaNyYq4w2Em2JrAWSqgfQ%3D',
          ),
        },
        {
          label: '통일토론대회 형식 (준결승, 결승)',
          href: createTableShareUrl(
            'eJztlNFLwkAcx%2F%2BVcU8Fe0iNKN%2FU9iCkEzdfiohTTx3Nc2xGhQg%2BTJH0wR4KKQ2LoB56WIJQ0F%2Fkbv9DN1dhlhaY6ENP233G%2Fb6f%2B93tCkBKAq9nw8MCCadywFsAGGYR8AKr0iPtF8aqdMzrjlkvWRd1xmqekVp7idyW%2Bl2DnDyzjPNcBizIHyv2tEBMEPlQcJujCKYRTkIK6bui5jQRwWzYqU6MB6I%2FUp7I4WFuGk2aRfkhVLGE034ky8CbgrKGWJCSsKRlhlCRxsK4TCfuFICWhzhh14hEeYFW0BSEEhnR0SJXZboMSuO5ozcU5qMh35ZtLtnR7tUV%2BnVQGx%2FIsoMjSLXlRpCgILhP5d6xZo%2BRSmu6zG4VFNkhmQAfXhyZMBcTo4OYEZ9T0tEZUmv1DX2S1tr0VvbwxwbZp2Byg1zrf9Ag95cGfXd05iYz7W653DPYrnFSHZ1cNph%2Br0GMe3JXJe3mJzUxGOL2%2FD6B2%2FzQc5LG%2Bg2a%2Bq%2B3EHqLdj%2BQXovclBnTaJHzp1n%2FAsDzq2tiHk67xVcoYtDy',
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
            'eJzVkk9PwjAYh78K6XmHOQ0xvQHWhEQ2so2LhpACBRZHt2wjasgSD%2BBFD56Ih0lQrx7wYKIJ32j1O9hS5I%2Fh4g1vfZ%2B2v%2Fd5m%2FaB0wRw%2F%2FBAAQ5teQD2AcVdAiBIPwfsZcZGM3b7mNGglmHje5ZMvm4m6dMEKCC68sWxQsWyjVLxFHGE24Q2MYd87QdeaBPc1WUam76ywRvnDY%2Bu83T6kN5dc36BA%2BrQdp64LoAt7IZEAS2HOmFHoijokZh3xXWX3zvrgzDCtCEiyqZh8YDQJ6TRsaUVGw%2BlZd27XCDdMEu5EyHuiM5ZlW%2FOk3nWYpY8OjZMVEP60fKYKox7NAJQi6sSlkkgBgCQ9lx3iSyf4HM%2BwA8ORU0CWcbKmm%2FB0P%2BVr44qtjk3%2BaW88R1W4naxhGr5nIVWVrKF1N%2BwkGJZVd3itaepf37G94Q9DzPpNGGjj918za2%2FdTe1q%2FE3Vb9xjg%3D%3D',
          ),
        },
        {
          label: '2:2 CEDA 토론',
          href: createTableShareUrl(
            'eJztlTFPwkAUgP9KczMDNMRoN8AzIZGWQFk0hBxwQGM5mhaihpA4gDHBARfCUAzqoINDHUg04RfR8z945RBQCIsxonHrfb2%2B973r62sdaHkgBf2iD2ikUAFSHRBUxkAC7kuT3o1od0TbfUGURCECd0PC6%2FnAvRkAH6ieGt6uSCqpKrHoAWQIFTHJIwbZtWFWLBWjssyDUeeRNp8Yz1XIInednnt5xvgxMolGimGs60AqIN3CPlDQiGaVOKqaNdxgWVFWZ88d1oFVRSTnhYgnlCQLYBkY50oqt6LXLW6ZrZxMkawkYqF9T1zzMu%2F42c1JZBZrWksY7ikJmIHy7myb3zOukSqQxEaawzg2vQKARGq6PkNJA6MjVsA7trw1Nvmy4VvwlWFKTUxMPilf0UFToG177DTXmW%2F9mHlEkZdOejzsUOdBoPcXtN9bpx3Y3ijv%2Fw75DvNV3%2BJv6JCvnnhA3Dz1DrUHs2k9N1ejMZgJh5JwbsVTcP0PFlws6L2XJa9JyX%2Bxh1dOi6FNb1uC69i0%2B7yZQ2Plb3AztdONN32z7RU%3D',
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
            'eJzFkk1LAkEYx7%2BKzHkPvkDI3tT2ILS74q6XImLUUZfW2WXXqBAhIiPIgxCGhzW0Q3TwsEWCn8kZv0MzrpnYix4Kb%2Fv8Zvb%2F%2FHieqQOjCMRYPCYAA5csINYBhlUEREB7bxO%2FTW97oWmnywoybpGnIbnzQtPrPhn0gQBq5za%2Fmcppuiqn9yWGYBnhImSQfduO5eoIVpV5oD%2BkVy%2BMFyy8zInfJa0Lxk%2Bhgw1cTiLTBGIJmi4SQMnAhltZQg3WFuZN9uNBHbg1iAs8I5NVNZbg2ggVKnqgRR%2BagWbeOpsjRc3KiT1ubvDWkXiYnc6y8YlpBjiDHC63gjQbwWMm94FdXiOHZUbI6w1oCEsyKVX5IjMZtan%2FTAc%2BvRz%2BqhT9A6XoRkpbm893y9ryfBQpp2dnbVZG1KZef%2FHeP630tCwdJROatLswC5r8qLYTDq834%2BX6vY08%2BtgMEd%2Bj9%2BN%2Fn1Vso%2FVtw%2Bmw8Q6hkrn4',
          ),
        },
        {
          label: '2:2 자유 토론',
          href: createTableShareUrl(
            'eJyrVspMUbIyMTTQUcrMS8tXsqpWykvMTVWyUnozd8urDRPedM9VMLIyUngzb8KbOQveti14vXCBko5SSWUBSI1zaHCIv69nlCtQKDE9NS8lESgIZBcU5ReHpCbm%2BkGN2rDmTctGoHhyfh6y%2BOsNM173NADFyxOL8jLz0p1Sc3KUrNISc4pTdZTSMvMyizOQhGqB1iYm5QA1RlcrFZck5iWDzAgI8g8GmlBckJqanBECcdabea0QZyblV0CF%2FPyDfB19QC7PBFltCfRvEtjovNKcHIhoQGoRyG1oQsEFqYnZQLfBhItB%2FNQiCLdWB8klzv5%2Bg8Qlfq6hIUFgO9AcgxKHCCeFePq6xjs5Bru6wJ0FsQKnw8yNDLC4yxAkSmIAbZ3zZlGrwusNc95M20HvcMKadujtoNhaAMq8Q9Q%3D',
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
            'eJyrVspMUbIyMTTQUcrMS8tXsqpWykvMTVWyUnozd8urDRPedM9VMLIyUngzb8KbOQveti14vXCBko5SSWUBSI1zaHCIv69nlCtQKDE9NS8lESgIZBcU5ReHpCbm%2BkGN2rDmTctGoHhyfh6y%2BOsNM173NADFyxOL8jLz0p1Sc3KUrNISc4pTdZTSMvMyizOQhGqB1iYm5QA1RlcrFZck5iWDzAgI8g8GmlBckJqanBECcdabea0QZyblV0CF%2FPyDfB19QC7PBFltCfRvEtjovNKcHIhoQGoRyG1oQsEFqYnZQLfBhItB%2FNQiCLdWB8klzv5%2Bg8Qlfq6hIUFgO9AcgxKHCCeFePq6xjs5Bru6wJ0FsQKnw8yNDLC4yxAkSmIAbZ3zZlGrwusNc95M20HvcMKadujtoNhaAMq8Q9Q%3D',
          ),
        },
        {
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJzVlc1Kw0AUhV%2Bl3HUWbRXU7PoTQbBJaetGKTJtp20wnYQkRaUERFQUXbgRXKi0K110EQVfykzfwTumlkKlZCXTXeZk5sx3DydkAGYL1LWtDQVM1rZBHQAjPQoqTB6eJlfD6PWG3z6nCloxlxLL0RAU8E8dsaOwV60ZpZ19DSXSoaxFUMRnx7W9GiU9PTbi4ZhfvKPetNm8HoWP0d0Z6sfEZSbr5KllgdomlkcVaJvM9Lqx5Lt9GuCtpGHhuYMBeD5hTWFRrhhVNPAcSpvdWkzFXy5jyoZ9MpV0o1LK7QpwU9ycXU%2Fj2x9rNJsOk9e2jYp2qOnF2b60QO4zH08E9VgsU1dMACrrW9ZMqjqUHOEEv7In1tRF10z0cQ2BModcMPQF5K%2FPex6%2B8VHIz8fLwDOb%2FwaeTQQuedZ%2F1UPCrJOBS5V1snqsRNbS93ox6xXpdbKSiN%2FA8qyl%2BxQlR5Y%2B5WSNlhC5HnwD9JgkZg%3D%3D',
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
            'eJzVlU1LwzAcxr9KybmHvVxcb3upILh2dN1FGZJt2Vbs0tJuqIyCSCfCPOhB8TBl86SwQxUGfqY1fgeTbY7hhBUPkt2Sp%2BmT3%2F%2FhKe0CowakZColAgPXLSB1AYYtBCRA%2FEEYvJLh3eflkPQfhaycSwt0HY6GQATtM5sdypaKuprfO5CpBBsI1yAV6dp2LFdHsKUsvIIx8d%2BoXrXwqh4GD%2BH1OdVPoIMN3Mgg0wRSHZouEkHdwIbbnEttp4M8eiusmPS9wy5w2xBXmUVBU4vUwLURqjb1ORV56s0pK9bpQlJULZ%2FeZ%2BAGuzmeiNGnM2tqthgmI%2B%2BqmnwkK7nluRhD7uA2kBJeeS4WkMMmABLumOZSKtoIHtMJvmWX7ZFDXePh%2BxXwxBXkrKqsIU8nNyR4EcgoIBdjTsgTkcg5D%2Fu3fvAYdjRyrsKO1o%2FtCJv7Zq%2BHvS3NXidX5JKuzWB%2B5H1Lhr5A%2BoNp4PMBz7Ybe8L%2BYht6svNvaScj9YRz5D%2BmzNvXuIXIZDIgzz0hDAbk%2FoMT8mj94Je87H0B1zvnzQ%3D%3D',
          ),
        },
        {
          label: '국회의장배 토론',
          href: createTableShareUrl(
            'eJzdk0FLAkEUx7%2BKzNnDah5qb2obCLkr7nopJEYddWmdXXZXKkSIsAj0YIdAQmU9BAUGk%2BCXcsfv0KxrainhKazb7o%2BZ%2F%2Fu94b0aUAuAj3BcEKi4qAO%2BBjCsIMAD2ui65JU6j9M7hzZ7gcn4bfrUor0O7T%2B7hAQYdgcOCAL7yvDOxzOyIiUTJwJDsIRwATLIvg1TtxQEK%2BI8lgxp453xvI5XuUs6buua8QtoYhWXYkjTAF%2BEmoWCoKhi1Sr7yDarqM6qwpzG7p3WgGVDnPciUmlJZgGWgVC%2BrPhWtH%2FrW%2Bb0yzkSpXQyeuyJq17lUJj1nptFs7B5MzHhSEoLZ4J4uDjHecpVbAM%2BXM%2F6MIVMrwPA46qmLZBsIHjOOvjElvePTJYackf3oB5cUY5L4n9QnozblLwE6IDQm%2BGOmIfXzDfNx98wF4WMkp7JfJuUNu06i0VcuiuJpHAWi8rC0ssv4jfwxcNXi%2BxzG8xmTS%2FEvGvbaT1QpxGgze6ENH5604PfetI1842jMCK7s3d72%2B3d7iln6x%2Fd%2BDWm',
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
          label: '초등부',
          href: createTableShareUrl(
            'eJztVsFKw0AQ%2FZWw5xTaKKXk1moEwSYlTS%2BKyFq3bTDdlqSiUgoiRQQ9KIJ4EKkgeLCHtIj0m9z1H9xtYkwxVPRgKeaWvLzMzL7HzGwbmDtAljKSCExcaQC5DTCsIyADevNAj116diu8nfTIfU9ICPT5lFwNyMsREEHrsMlZS6WioeVX1xUGwSrCO5CB7LlpNxwDwbrqB3P7tDtgeLmBwzhxb8g5D7cPbWziag5ZFpAr0HKQCComNp1aCOqwtHDbYj9utIHTgrjMYxR0rcgiOE2EyjXDK4sOn8jwlD6OBC%2BzQNxbej1itO3Ggc9RNT2fXeNHMXkt0mKSfR0nY9H942VXDEXfKhpZ3QiIC0l%2BjD3cAnKqIwbUnLKi6cqWoi7%2FgvlJlEJEL3uYlwiFXOhsenAB2VxSIOM9ywqgYhPBXSbpB%2Bzwd2Rze3iKQD5VKRn6WIdJBe8uaa8rMP9f3e403dKBbBPpf1IRf52oaUlTv7eUnvVJf6qlqUyEpRHqp3%2Fl0z9V32vZuKHmytLpM9K3NG6oP1SfXF7EG2p%2BLY2akV8sjRtqJurHG2oOLZ0%2BI%2BMNNYP7QXcUb6j5tTTyFh9YGs%2FICEs3O%2B8MouWw',
          ),
        },
        {
          label: '중등부',
          href: createTableShareUrl(
            'eJztVkFrwjAY%2FSsl5wp1goze3FZPWyu1Ow0ZVTNXVttiK2xIQUYZA3eYDIYHGQ6EHeahehj%2BpiX7D2utdhVLxzxMCrklX1%2B%2BJO%2F1fV86QKkDlqGBol3ogO0ATW5CwAI8GONbF%2FeG1NfdCL2OqAyFx330NEUfXUADuQG1uuzhvLHR0k0Jyk1%2BudKdYGfqxWu6Fo0jd4AeusCmgSVXVS9y1gGmJWs1%2F2NJFMreEtOAsHYp3RiLRLN3NLvHb3MqSEkhd4if5x6sql8vMbwgnhSOvZCl%2BJvkGCYYlmDL3xqwWltVw1DZgPKVojVWYdOfw1ZwjSpU1cWhrCB1oShx4nlZKohSJL9%2FrbZmATZr0yH0gCsKInfO8UdbIH%2BAexFgsHsUl4mkzNkVHxvSx3OnkrjgYZ3Blz4eOZSn4qfrJPGWZ1b3X%2BPrLxT607UzHQr875Li3gRNEiXN7jOb2sTQmN%2BK8MqWv0vK2Q%2B8SAyVKkMl18ilpMRQ%2F8g%2B6j%2BSDpVeQ8XVyA1JiaF2wj7pUCk0VHKNJB1qB%2B8DZ046VHoNFfuKDyUlNTJG0or9DTqI0dk%3D',
          ),
        },
        {
          label: '고등부',
          href: createTableShareUrl(
            'eJztVlFLwlAY%2FSvjPk%2BYCRJ7s5pPtclcTyEy9WajuQ03oZCBxIjAHpIgfJBYEPSQD9Mg%2FE3e9R%2B6czYnjkU%2BJIO93fvt3O%2Fee87O990ukBqApkggKecqoLtAEVsQ0MAdvro3jtsfEV%2B3NnqxiQwx%2F7DR4wR99gAJxCZUGiLG4bHWVnUBii12udIZu9YEx%2BuqEo4jZ4jue8AkgSHWZBw56wLdEJW697HEc2W8RNcgrF8I19oi0fQdTe%2FctxnhpySQM3KfZhhWU6%2BWGJbjTwrHOGRI3ia5POUPS7DtbQ1opSPLQaisQfFSUpo%2FYd2bw7Z%2FjRqU5cWhDD91oSgwfLUsFHhhlZ%2FyrtVRDEBnTTKAHjBFjmeqDHu0BXIF3AsB%2Fd3DuEwoZc6seNiAPpY5FfgFD%2BsMPg9c2yKwinPHiuPNo82%2F%2Fxpff6HQm66d6ZBjf5fU7Y%2FROFbS7D61qU0EjfmtCK9s%2BbsknH3fi6mhEmWo%2BBq5lDQ11D%2ByjwYPaYdKrqGiauSGpKmhdsJ%2B2qESaKj4Gpl2qB28D6xZ2qGSa6jIV3wgaVojIyStmN8r8tIZ',
          ),
        },
      ],
    },
    {
      title: '노곳떼',
      subtitle: '한국외대',
      logoSrc: nogotte,
      actions: [
        {
          label: '자유토론',
          href: createTableShareUrl(
            'eJyrVspMUbIytrDQUcrMS8tXsqpWykvMTVWyUnrduuPV5s2vp%2B150z1X4c28CW%2FmLHjbtuD1wgVKOkollQUgJc6hwSH%2Bvp5RrkChxPTUvJREoCCQXVCUXxySmpjrBzHpzYY1b1o2AsWT8%2FOQxV9vmPG6pwEoXp5YlJeZl%2B6UmpOjZJWWmFOcqqOUlpmXWZyBJFQLtDYxKQeoMbpaqbgkMS8ZZEZAkH8w0ITigtTU5IwQiLPezGuFODMpvwIq5Ocf5OvoA3J5JshqMwOgJNjovNKcHIhoQGoRyG1oQsEFqYnZQLfBhItB%2FNQiCLdWB8klzv5%2Bg8Qlfq6hIUFgO9AcgxKHOJ1kaGRAA0dhi6hXmzYMkoiin0tiawFdfDzC',
          ),
        },
        {
          label: 'CEDA 토론',
          href: createTableShareUrl(
            'eJzNlTFPwkAYhv9Kc3MHgcRIN0QGE2kJlEXjcMABjeXatBg1hMQBDAkOOkg0Kaa6uDBUiQmDv4g7%2FoN3VA0BJB2QuvXea7%2FvyXvvfW0ArQSk2E5cBBouG0BqAAxrCEiAtEfj4ZD0Pmi3LyRTewlhcuWSJxeIoH5h8jeS%2BZyqpPcPU0yCFYRLkIns2bQMW0WwJvuFqDegrVemFw08qxPvnlxfMv0MWljDlV2k60AqQ91GIihrWLOrM1KTtYUFnX141AB2HeIir5HJKjlWwTYRKlZVH4s%2Btn3MgnH%2BJclKNp044OQabx2JbrHdaW18quu%2BnEEWh5uTciaCJwzuW7b5GlmsZoS8dUBTnIFJKvICzOThjvZH9KVDBqNVSNtrIIoGIgrNnmVnFa49y4h4KjdgT%2BzfpSdYnkOzJ%2Bz0LNojp%2FJqdtpl7n7dUMf9mZW%2FQsXXQMWXwZhuqdsSaNcZe62%2FPrwFqBCvWbCRGBrM0t%2FXu0Of2wLxHNpbmeoNzqEwmI6bn4qAFGY%3D',
          ),
        },
        {
          label: '의회식 토론',
          href: createTableShareUrl(
            'eJzN1MFLwlAcB%2FB%2FRd55kFMI201rByGduHkpIp761NF8E2dUiCChEejBoERCRTt18LASw0N%2FkXv%2BD73nKq2sJLK87X3Zfr%2FPfntveaDGgeDecHJAxQkdCHmAYRoBAVjl4ajft%2BqPpNJykFZjfF1lV%2BOzjtXtAA7kTjLsts2IrEgB%2F45II5hEOA5pSK8zWd1QEEwH7WrE7JHSHc1jOp7NLbNhVYs0P4JZrOKkD2kaEBJQMxAHEipWjdRMVKBtYVSjD%2B7mgZGDOMZqhMKSTCsYGYRiKcVmkXbZZkb14%2BcoKIUD3m0mV1lr3kXfOTqpjQ81zY5DKMtw7yI5g%2BABxb3EBlujLK3JW%2FfnoMDNYDal4Opg5k7m4XJkFm0S52DzN6%2BWTnMtNqfVoAXFiBKetHmj4wV%2BuvunJsUfEPd9XlncenXZLT6F8R7n9y62XERF2jXS7PyKy70%2BzzUZ8g9YF6RTcpBKc2SWlv0NP6Dmba7RoEbMW9I1yWnvS5Dnz47iCpLIoEluyvTsNUl9uPyzt%2BZe7MfwL6q9whOwPJLP',
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
            'eJzVkj9PwkAYh79KczNDaRi0G2BNSKQlbVk0hBxwQGO5Nm2JGtLEAVwk0cE%2FxKBBTZwcaqKGQb8QLd%2FBO4oI2MVJ2HrP9X7v8755W0CrAD7BJmJAw1UD8C2AYQMBHgSfF6OhNz4ZBKe3DMdzTHD96j9R4N8P%2FO7x%2BKbLjHuX5BbEgHNk0jfpvKJK2cyuQBCsIVyBBJJv0zJsFcGGOI32noP2C%2BFlA89z3%2BuRYMIPoIU1XEshXQd8Feo2ioGqhjW7HiLHaiKXVIUlnbzbawHbgbhMI3KypJAA20SoXFdDq%2BCuQ5QJLRmHUyRKcja5Q8U1WnmTJZeTZJI17SUlbEuyUBTErdlvLDVuYgfwnFsIYQ5ZtAHA46auz5BiIrhPGvjGNj0jKzy6sTnftCSula8o5FV5YrKkfB70B%2BFuLIirmaxQTCUV4ccqLBHqL1iEYgmOjfCKU%2FrHMT5%2B%2BGft0TtZ099eSwONb%2FzbRCM3dj3UI6f%2B1g8eOozv9YOr4WrucOTEV1O74H4BEob9Fw%3D%3D',
          ),
        },
        {
          label: '3:3 통일토론대회 형식',
          href: createTableShareUrl(
            'eJztlk9LAkEYxr%2FKMmcPphW1t7QNgtwV%2F1wKiVFHXVpH2VUqRPCgEihUUCGhYXWoQ4eNMDzYF9odv0PvqonE4nmMbjvPzDzze1%2BeHaaC1DQS170bHqTSTAGJFURxniARsa8ba2iOm33W6gl%2B0S%2BMmwPWG4FgP%2Fbtdm183xbGnVuYRR5UOi86e4LxaEwJ7R9KIOEsoWkMInwX9YIRIzgvz6zNN1Z%2FBz1VoIu6bXbAGPRTrFOVZgNE05CYwZpBPCijUtXITaWSXiZVOBUnNdh3VEFGCdOUYxGOKFEwMIqEpHKxKRV7aAAyqMnC2UySlUho58ABV52T13xemJ1Yg9msmIC0p0SkY0nena%2FzOshlWkKir5qYimGiOxUgkZY1bS5FiwSfQAU%2FsuGMiT4dVj0LwEFFXi1gWYrHIhOUX8zXrF8XWKtrmfVl6JtctdoaXDHzlb1csF6H04a7RdpuDeyP2jLgba54V6DNbunguc2r%2Bx%2B6Bhqufm6vPNdo8Az8t7LBnkf2Zd36hPfG5PGxtOlbXKVkRdD%2Fu84N%2BqDLnhqCbXbZ3ZDT28U1LZxyJ6rfo3R1ow%3D%3D',
          ),
        },
        {
          label: '3:3 통상토론대회 형식',
          href: createTableShareUrl(
            'eJzVkkFPwjAYhv8K6XkHRKNJb4A1IZGNbOOiIaRAgcXRLduIGrJEo3KRgwdNiFGDdw%2FTxMSLfwi2%2F%2BBXigjqxRve1qfr%2Bz1v0x6yGghvpDcVZPGmg3APcdphCKP4%2FXr8FiX9UXx5n1rH66mk%2FxqfnQKYPI4mg5PkdpBKhjewixQUHLviTL5smFqxsEcA0RbjDQoQvl3P8U1GO%2BosOnqKz5%2BB1x2%2ByCfREIKBH1KPW7yVY7aNcJPaPlNQ0%2BKW35Yo8LoshKm0ZsO5%2FR7yA8rrIqKkawYE%2BC5j9bYpreKHC1AGWnOOZkjV9GJ2V4hbYvJaJg2702gIm5XJkR1NJ1Wibs%2F%2FSwvlLg8QzoQVCUvMEw0Q5l3bniPDZfQAGnxiX6yZJ5ehsiCc19T%2FJaySsqlPVb45X8V3I%2Fk6lszNQpFUc1mDfFnJEVJ%2FyUKKbYlyP7ymlf92j%2BOXaHXv8beXunLClfAD%2BBVxjw%3D%3D',
          ),
        },
      ],
    },
  ],
};
