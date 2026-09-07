export type PartyNames = [string, string, string, string, string];

const TANKS = [
  '不开墙防战',
  '减伤存下周血DK',
  '拉火车熊德',
  '背对全队防骑',
  '一口闷酒仙',
  '仇恨交给命运坦',
  '不看词缀坦',
  '换装备坦',
];

const DAMAGE_TRIOS: [string, string, string][] = [
  ['奥利波斯猎人', '不躲地板的法师', '不开减伤的狂战'],
  ['出圈术士', '坐骑绑保命贼', '问号萨'],
  ['吃满点名猎', '读条读到死法', '问奶妈术士'],
  ['墙后盗贼', '开场交光环骑', '位移当减伤DH'],
  ['集合石秒锁猎', '不报技能武僧', '尾王才驱散牧'],
  ['见圈就跳猎', '药水留下把法', '火里打断萨'],
  ['贴脸吃溅射战', '红圈搓爆发术', '被击飞才位移贼'],
  ['奶不到就问号猎', '满血不减伤法', '死后说卡骑'],
];

function hashSeed(seed: string) {
  let value = 2166136261;
  for (const character of seed) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function partyNames(seed = 'default'): PartyNames {
  const hash = hashSeed(seed);
  const trio = DAMAGE_TRIOS[hash % DAMAGE_TRIOS.length];
  const tank = TANKS[Math.floor(hash / DAMAGE_TRIOS.length) % TANKS.length];
  return [tank, '你·奶龙', ...trio];
}

export function renamePartyText(text: string, names: PartyNames) {
  return text
    .replaceAll('你（恩护唤魔师）', names[1])
    .replaceAll('自己', names[1])
    .replaceAll('输出甲', names[2])
    .replaceAll('输出乙', names[3])
    .replaceAll('输出丙', names[4])
    .replaceAll('坦克', names[0]);
}

export const DEFAULT_PARTY_NAMES = partyNames();
