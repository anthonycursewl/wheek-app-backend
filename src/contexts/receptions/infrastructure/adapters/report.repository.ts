import { ReportRepository } from "../../domain/repos/report.repositort";
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { ReceptionWithStore } from "../../domain/repos/reception.repository";
import * as path from 'path'

const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

export class ReportRepositoryAdapter implements ReportRepository {
    private printer: PdfPrinter;

    constructor() {
        const fonts = {
            Onest: {
                normal: path.join(process.cwd(), 'dist', 'fonts', 'Onest-Regular.ttf'),
                bold: path.join(process.cwd(), 'dist', 'fonts', 'Onest-Bold.ttf'),
                italic: path.join(process.cwd(), 'dist', 'fonts', 'Onest-SemiBold.ttf'),
            }
        };
        
        this.printer = new PdfPrinter(fonts);
    }

    async generateReportByReceptionId(data: ReceptionWithStore): Promise<Buffer> {
        let totalCost = 0;

        const tableBody = [
            [
                { text: 'Producto', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
                { text: 'Costo Unitario', style: 'tableHeader', alignment: 'right' },
                { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
            ],
            ...data.items.map(item => {
                const costPrice = Number(item.cost_price);
                const subtotal = item.quantity * costPrice;
                totalCost += subtotal;
                return [
                    item.product.name,
                    { text: item.quantity.toString(), alignment: 'center' },
                    { text: formatCurrency(costPrice), alignment: 'right' },
                    { text: formatCurrency(subtotal), alignment: 'right' },
                ];
            }),
        ];

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 80, 40, 60],
            header: {
                stack: [
                    { text: data.store.name, style: 'header', alignment: 'center' },
                    { text: 'Reporte de Recepción de Inventario', style: 'documentTitle', alignment: 'center' },
                ],
                margin: [40, 30, 40, 10]
            },
            defaultStyle: {
                font: 'Onest'
            },
            footer: (currentPage, pageCount) => ({
                text: `Página ${currentPage.toString()} de ${pageCount}`,
                alignment: 'center',
                style: 'footer',
            }),

            content: [
                {
                    columns: [
                        {
                            width: '50%',
                            text: [
                                { text: 'Recepción ID: ', bold: true },
                                `${data.id}\n`,
                                { text: 'Fecha: ', bold: true },
                                `${new Date(data.reception_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}\n`,
                            ],
                        },
                        {
                            width: '50%',
                            text: [
                                { text: 'Proveedor: ', bold: true },
                                `${data.provider?.name || 'N/A'}\n`,
                                { text: 'Registrado por: ', bold: true },
                                `${data.user.name}\n`,
                            ],
                        },
                    ],
                    style: 'infoBlock',
                },

                {
                    table: {
                        body: [
                            [
                                {
                                    text: `Estado: ${data.status}`,
                                    fillColor: data.status === 'COMPLETED' ? '#22c55e' : '#ef4444',
                                    color: 'white',
                                    bold: true,
                                    alignment: 'center',
                                    borderRadius: 4,
                                    border: [false, false, false, false]
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [200, 10, 200, 20]
                },
                
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: tableBody,
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex % 2 === 0) ? '#F3F4F6' : null;
                        },
                        hLineWidth: () => 0,
                        vLineWidth: () => 0,
                    },
                    style: 'itemsTable'
                },
                {
                    table: {
                        headerRows: 0,
                        widths: ['*', 'auto'],
                        body: [
                            [
                                { text: 'Total General', style: 'totalLabel', alignment: 'right' },
                                { text: formatCurrency(totalCost), style: 'totalValue', alignment: 'right' },
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 10, 0, 20]
                },
                
                {
                    canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#cccccc' }]
                },
                {
                    text: 'Notas Adicionales',
                    style: 'subheader',
                    margin: [0, 10, 0, 5],
                },
                {
                    text: data.notes || 'No se registraron notas adicionales.',
                    style: 'notesText',
                }
            ],

            styles: {
                header: { fontSize: 24, bold: true, color: '#111827' },
                documentTitle: { fontSize: 12, color: '#6B7280' },
                infoBlock: { fontSize: 10, margin: [0, 0, 0, 10] },
                subheader: { fontSize: 14, bold: true, color: '#374151' },
                itemsTable: { margin: [0, 5, 0, 15], fontSize: 10 },
                tableHeader: { bold: true, fontSize: 11, color: '#1F2937', margin: [0, 5, 0, 5] },
                totalLabel: { fontSize: 12, bold: true, color: '#1F2937' },
                totalValue: { fontSize: 12, bold: true, color: '#1F2937' },
                notesText: { font: 'Onest', color: '#4B5563', fontSize: 10 },
                footer: { fontSize: 8, color: 'grey' }
            },
        };

        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        return new Promise((resolve, reject) => {
            try {
                const chunks: Buffer[] = [];
                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
                pdfDoc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}