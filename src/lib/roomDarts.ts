import type {
  PendingDartDto,
  RoomTurnDto,
  SaveRoomDartBody,
} from "@/api/roomsApi";
import type { DartHit, Ring } from "@/lib/dartboard";
import type { TurnRecord } from "@/lib/gameLogic";

export function ringToMultiplier(ring: Ring): number {
  switch (ring) {
    case "DOUBLE":
      return 2;
    case "TRIPLE":
      return 3;
    case "BULLSEYE":
      return 2;
    case "BULL":
    case "SINGLE":
      return 1;
    case "MISS":
    default:
      return 0;
  }
}

export function hitToRoomDart(
  roomPlayerId: string,
  hit: DartHit,
): SaveRoomDartBody {
  const segment =
    hit.ring === "BULL" || hit.ring === "BULLSEYE" ? 25 : hit.sector;

  return {
    roomPlayerId,
    segment,
    multiplier: ringToMultiplier(hit.ring),
    score: hit.score,
    x: hit.x,
    y: hit.y,
    angle: hit.angle ?? 0,
    radius: hit.radius ?? 0,
  };
}

export function pendingDartToHit(dart: PendingDartDto): DartHit {
  const ring = pendingDartRing(dart.segment, dart.multiplier, dart.score);

  return {
    sector:
      dart.segment === 25 && (dart.score === 25 || dart.score === 50)
        ? 0
        : dart.segment,
    ring,
    score: dart.score,
    label: pendingDartLabel(dart.segment, dart.multiplier, dart.score),
    x: dart.x ?? 200,
    y: dart.y ?? 200,
    angle: dart.angle ?? undefined,
    radius: dart.radius ?? undefined,
  };
}

export function roomTurnDartToHit(dart: RoomTurnDto["darts"][number]): DartHit {
  const ring = pendingDartRing(dart.segment, dart.multiplier, dart.score);

  return {
    sector:
      dart.segment === 25 && (dart.score === 25 || dart.score === 50)
        ? 0
        : dart.segment,
    ring,
    score: dart.score,
    label: pendingDartLabel(dart.segment, dart.multiplier, dart.score),
    x: dart.x ?? 200,
    y: dart.y ?? 200,
    angle: dart.angle ?? undefined,
    radius: dart.radius ?? undefined,
  };
}

export function roomTurnToTurnRecord(turn: RoomTurnDto): TurnRecord {
  return {
    playerId: turn.player?.id ?? turn.playerId ?? "",
    playerName: turn.player?.name ?? "Gracz",
    darts: turn.darts.map((dart) => ({
      sector:
        dart.segment === 25 && (dart.score === 25 || dart.score === 50)
          ? 0
          : dart.segment,
      ring: pendingDartRing(dart.segment, dart.multiplier, dart.score),
      score: dart.score,
      label: pendingDartLabel(dart.segment, dart.multiplier, dart.score),
      x: dart.x ?? 200,
      y: dart.y ?? 200,
      angle: dart.angle ?? undefined,
      radius: dart.radius ?? undefined,
    })),
    totalScored: turn.scored,
    bust: turn.bust,
    startScore: turn.startScore,
    endScore: turn.endScore,
  };
}

function pendingDartRing(
  segment: number,
  multiplier: number,
  score: number,
): Ring {
  if (score === 0 || multiplier === 0) return "MISS";
  if (segment === 25 && score === 50) return "BULLSEYE";
  if (segment === 25 && score === 25) return "BULL";
  if (multiplier === 3) return "TRIPLE";
  if (multiplier === 2) return "DOUBLE";
  return "SINGLE";
}

export function pendingDartLabel(
  segment: number,
  multiplier: number,
  score: number,
): string {
  if (score === 0 || multiplier === 0) return "Pudło";
  if (segment === 25 && score === 50) return "50";
  if (segment === 25 && score === 25) return "BULL";
  if (multiplier === 3) return `T${segment}`;
  if (multiplier === 2) return `D${segment}`;
  return String(segment);
}
