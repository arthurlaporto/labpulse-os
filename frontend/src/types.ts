export type EntityKey =
  | "servicos" | "projetos" | "usuarios" | "laboratorios" | "equipamentos" | "manutencao";
export type StoreKey = EntityKey | "campi" | "usuariosOpcoes";

// Uma linha vinda da API: sempre tem id numérico; o resto varia por entidade.
export interface Row { id: number; [field: string]: unknown }

// Valores do formulário (tudo digitável vira texto, número ou booleano).
export type FormValues = Record<string, string | number | boolean>;

export type FieldType =
  | "text" | "email" | "password" | "number" | "date" | "datetime-local"
  | "textarea" | "select" | "checkbox" | "file" | "range";

export interface Option { value: string; label: string }

export interface Field {
  name: string;          // mesmo nome do campo na API
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];    // value = o que vai para a API; label = o que o usuário lê
  ref?: StoreKey;        // select que lista os registros de outra entidade
  placeholder?: string;
  full?: boolean;
  min?: number;
  max?: number;
  editOnly?: boolean;    // só aparece ao editar
  clearable?: boolean;   // ao esvaziar na edição, manda null (remove o vínculo)
  requiredOnCreate?: boolean; // obrigatório só no cadastro (ex.: senha)
}

export interface EntityConfig {
  key: EntityKey;
  path: string;          // rota do front
  title: string;
  subtitle: string;
  createLabel: string;
  modalTitle: string;
  modalHint: string;
  fields: Field[];
  columns: string[];
}
