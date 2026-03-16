// 레이팅 색깔 타입
export type RatingColor =
  | "White"
  | "Blue"
  | "Green"
  | "Yellow"
  | "Red"
  | "Purple"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Rainbow"
  | "HyperRainbow";

// 레이팅 값에 따른 색깔 반환
export function getRatingColor(rating: number): RatingColor {
  if (rating >= 16000) return "HyperRainbow";
  if (rating >= 15000) return "Rainbow";
  if (rating >= 14500) return "Platinum";
  if (rating >= 14000) return "Gold";
  if (rating >= 13000) return "Silver";
  if (rating >= 12000) return "Bronze";
  if (rating >= 10000) return "Purple";
  if (rating >= 7000) return "Red";
  if (rating >= 4000) return "Yellow";
  if (rating >= 2000) return "Green";
  if (rating >= 1000) return "Blue";
  return "White";
}

// 레이팅 값에 따른 별 개수 반환
export function getRatingStarCount(rating: number): number {
  if (rating >= 16750) return 4; // 극무지개 4별
  if (rating >= 16500) return 3; // 극무지개 3별
  if (rating >= 16250) return 2; // 극무지개 2별
  if (rating >= 16000) return 1; // 극무지개 1별
  if (rating >= 15750) return 4; // 무지개 4별
  if (rating >= 15500) return 3; // 무지개 3별
  if (rating >= 15250) return 2; // 무지개 2별
  if (rating >= 15000) return 1; // 무지개 1별
  if (rating >= 14750) return 2; // 백금 2별
  if (rating >= 14500) return 1; // 백금 1별
  if (rating >= 14250) return 2; // 금 2별
  if (rating >= 14000) return 1; // 금 1별
  return 0; // 하양 ~ 은 (0 ~ 13999)까지는 별이 붙지 않음
}

// 레이팅 배경 이미지 경로 반환
export function getRatingBackgroundImage(rating: number): string {
  const color = getRatingColor(rating);
  return `/share/assets/ratings/Color=${color}.svg`;
}
