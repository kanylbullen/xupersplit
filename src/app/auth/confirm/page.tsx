import { ConfirmClient } from "./ConfirmClient";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    code?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <ConfirmClient
      tokenHash={params.token_hash ?? null}
      type={params.type ?? "email"}
      code={params.code ?? null}
      next={params.next ?? "/"}
    />
  );
}
