import debateKoreaLogo from '../../../assets/organizations/debate-korea.webp';
import fedcLogo from '../../../assets/organizations/fedc.webp';
import governmentLogo from '../../../assets/organizations/government.webp';
import hanAlmLogo from '../../../assets/organizations/han-alm.webp';
import igamLogo from '../../../assets/organizations/igam.webp';
import kogitoLogo from '../../../assets/organizations/kogito.webp';
import mcuLogo from '../../../assets/organizations/mcu.webp';
import nogotteLogo from '../../../assets/organizations/nogotte.webp';
import seobangjeongtoLogo from '../../../assets/organizations/seobangjeongto.webp';
import todallaeLogo from '../../../assets/organizations/todallae.webp';
import yuppmLawTrackLogo from '../../../assets/organizations/yuppm-law-track.webp';

export interface UsingOrganization {
  name: string;
  /** 대학 동아리의 학교 이름. 동아리명만으로는 알아보기 어려워 앞에 붙여 보여 줌 */
  affiliation?: string;
  /** 로고 이미지 경로. 없으면 이름 첫 글자로 대신함 */
  logo: string | null;
}

// 실제 사용 중이고 로고 노출을 허락받은 조직만 담음 (노션 "사용 조직 로고 매핑 확인" 기준)
export const USING_ORGANIZATIONS: UsingOrganization[] = [
  { name: '이감', affiliation: '경희대', logo: igamLogo },
  { name: '코기토', affiliation: '고려대', logo: kogitoLogo },
  { name: 'FEDC', affiliation: '고려대', logo: fedcLogo },
  { name: '서방정토', affiliation: '서강대', logo: seobangjeongtoLogo },
  { name: '노곳떼', affiliation: '한국외대', logo: nogotteLogo },
  { name: '토달래', affiliation: '성신여대', logo: todallaeLogo },
  { name: '한앎', logo: hanAlmLogo },
  { name: '목포가톨릭대', logo: mcuLogo },
  { name: '연세행정법학회', affiliation: '연세대', logo: yuppmLawTrackLogo },
  { name: '중앙선거방송토론위원회', logo: governmentLogo },
  { name: '디베이트 코리아', logo: debateKoreaLogo },
];
