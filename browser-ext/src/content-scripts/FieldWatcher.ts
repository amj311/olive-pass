import Observable from "./Observable";

export default class FieldWatcher {
  private field: Element;

  private listeners = new Map<string, Element>();

  constructor(field: Element) {
    this.field = field;
  }

}