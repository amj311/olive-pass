module.exports = class AlertManager {
  constructor() {
    this.alerts = [];
  }

  addAlert(alert) {
    this.alerts.push(alert);
    setTimeout(()=>this.removeAlert(alert), alert.timeout||5000);
  }

  removeAlert(alert) {
    let idx = this.alerts.findIndex(a=>a===alert);
    if (idx !== -1) {
      this.alerts.splice(idx,1);
    }
  };
}