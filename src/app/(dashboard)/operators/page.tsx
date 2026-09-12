import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listOperators } from "@/lib/actions/operators";
import { OperatorsView } from "@/components/operators/operators-view";

export default async function OperatorsPage() {
  const session = await getServerSession(authOptions);
  const operators = await listOperators();
  const canManage = session?.user.role !== "enforcement_officer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Operators</h1>
        <p className="text-sm text-muted-foreground">
          Registered tricycle and habal-habal operators in Midsalip.
        </p>
      </div>
      <OperatorsView operators={operators} canManage={canManage} />
    </div>
  );
}
