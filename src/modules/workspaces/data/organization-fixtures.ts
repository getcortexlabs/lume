import { createFixtures } from "../../cases/data/fixtures";
import type { Organization } from "../domain/workspace";
/** Independent fixture IDs keep cross-organization lookups unambiguous. */
export function organizationFixtures(organization: Organization) {
  const records = createFixtures();
  if (!organization.casePrefix) return records;
  return records.map((record, index) => {
    const names = [
      "Lia Exemplo",
      "Caio Exemplo",
      "Rosa Exemplo",
      "Lucas Exemplo",
      "Clara Exemplo",
      "Otávio Exemplo",
    ];
    const name = names[index]!;
    return {
      ...record,
      id: organization.casePrefix + record.id,
      name,
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join(""),
      source: `${organization.name} · demonstração`,
      description: record.description.replaceAll(record.name, name),
      evidence: record.evidence.replaceAll(record.name, name),
    };
  });
}
