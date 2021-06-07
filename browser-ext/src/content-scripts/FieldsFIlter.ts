export default class FieldsFilter {
  acctFields: Element[] = [];
  passFields: Element[] = [];

  constructor() {}

  public updateFilter(fields: {acct?:Element[], pass?:Element[]}): FieldsFilterResult {
    this.acctFields = fields.acct || this.acctFields;
    this.passFields = fields.pass || this.passFields;
    return this.evaluateFields();
  }

  public evaluateFields(): FieldsFilterResult {
    let success = this.acctFields.length == 1 && this.passFields.length === 1;
    return this.packageResult(success);
  }

  private packageResult(success: boolean): FieldsFilterResult {
    return new FieldsFilterResult(success, this.acctFields, this.passFields);
  }
}

export class FieldsFilterResult {
  success:boolean;
  acctFields:Element[];
  passFields:Element[];
  constructor(success:boolean, acct:Element[], pass:Element[]) {
    this.success = success;
    this.acctFields = acct;
    this.passFields = pass;
  }
}