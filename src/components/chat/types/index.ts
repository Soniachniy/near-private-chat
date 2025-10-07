import type { ModelAttestationReport } from "@/api/nearai/client";

export interface VerificationStatus {
  loading: boolean;
  error: string | null;
  data: ModelAttestationReport | null;
  isVerified: boolean;
}
