const PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const filteredItems = this.filterItemsByUserRole(user, items);
    const total = this.calculateTotal(filteredItems);

    const header = this.generateHeader(reportType, user);
    const body = this.generateBody(reportType, user, filteredItems);
    const footer = this.generateFooter(reportType, total);

    return (header + body + footer).trim();
  }

  filterItemsByUserRole(user, items) {
    if (user.role === 'ADMIN') {
      return this.markPriorityItems(items);
    }

    return items.filter(item => item.value <= USER_VALUE_LIMIT);
  }

  markPriorityItems(items) {
    return items.map(item => ({
      ...item,
      priority: item.value > PRIORITY_THRESHOLD
    }));
  }

  calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  generateHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    if (reportType === 'HTML') {
      return '<html><body>\n' +
             '<h1>Relatório</h1>\n' +
             `<h2>Usuário: ${user.name}</h2>\n` +
             '<table>\n' +
             '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
    }

    return '';
  }

  generateBody(reportType, user, items) {
    if (reportType === 'CSV') {
      return this.generateCSVBody(user, items);
    }

    if (reportType === 'HTML') {
      return this.generateHTMLBody(items);
    }

    return '';
  }

  generateCSVBody(user, items) {
    return items
      .map(item => `${item.id},${item.name},${item.value},${user.name}`)
      .join('\n') + (items.length > 0 ? '\n' : '');
  }

  generateHTMLBody(items) {
    return items
      .map(item => this.generateHTMLRow(item))
      .join('');
  }

  generateHTMLRow(item) {
    if (item.priority) {
      return `<tr style="font-weight:bold;"><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  generateFooter(reportType, total) {
    if (reportType === 'CSV') {
      return '\nTotal,,\n' + `${total},,\n`;
    }

    if (reportType === 'HTML') {
      return '</table>\n' +
             `<h3>Total: ${total}</h3>\n` +
             '</body></html>\n';
    }

    return '';
  }
}
