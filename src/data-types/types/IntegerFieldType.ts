import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import { ColumnDefinition } from "../../table/definitions/ColumnDefinition.ts";
import { RawRecord } from "../../record/RawRecord.ts";
import { NATIVE_DATA_TYPES } from "../../core/NativeDataType.ts";

export default class IntegerFieldType extends DataType {
  constructor() {
    super(NATIVE_DATA_TYPES.INTEGER);
  }

  getName(): string {
    return "integer";
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  setValueIntercept(
    _schema: TableSchema,
    _fieldName: string,
    value: any,
    _record: RawRecord | undefined
  ): any {
    return value;
  }

  async validateValue(
    _schema: TableSchema,
    _fieldName: string,
    _record: RawRecord
  ) {}

  async getDisplayValue(
    _schema: TableSchema,
    fieldName: string,
    record: RawRecord
  ) {
    return record[fieldName];
  }
}
