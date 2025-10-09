import { ReportRepository } from "../../domain/repos/report.repositort";
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { ReceptionWithStore } from "../../domain/repos/reception.repository";
import * as path from 'path'
import { AdjustmentWithStore } from "@/src/contexts/inventory/domain/entities/adjustment.entity";

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


    async generateReportByDateRange(receptions: ReceptionWithStore[], startDate: Date, endDate: Date, storeName: string): Promise<Buffer> {
        let totalReceptionsCost = 0;
        const content: TDocumentDefinitions['content'] = [];

        receptions.forEach((reception, index) => {
            let receptionTotalCost = 0;
            const itemsTableBody = [
            [
                { text: 'Producto', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
                { text: 'Costo Unitario', style: 'tableHeader', alignment: 'right' },
                { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
            ],
            ...reception.items.map(item => {
                const costPrice = Number(item.cost_price);
                const subtotal = item.quantity * costPrice;
                receptionTotalCost += subtotal;
                return [
                    item.product.name,
                    { text: item.quantity.toString(), alignment: 'center' },
                    { text: formatCurrency(costPrice), alignment: 'right' },
                    { text: formatCurrency(subtotal), alignment: 'right' },
                ];
            }),
            [
                { text: 'Total Recepción', colSpan: 3, alignment: 'right', bold: true, style: 'tableHeader' },
                {},
                {},
                { text: formatCurrency(receptionTotalCost), alignment: 'right', bold: true },
            ]
        ];
        totalReceptionsCost += receptionTotalCost;

        if (index > 0) {
            content.push({ text: '', pageBreak: 'before' });
        }

        content.push({
            stack: [
                {
                    columns: [
                        {
                            width: '50%',
                            text: [
                                { text: 'Recepción ID: ', bold: true },
                                `${reception.id}\n`,
                                { text: 'Fecha: ', bold: true },
                                `${new Date(reception.reception_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}\n`,
                            ],
                        },
                        {
                            width: '50%',
                            text: [
                                { text: 'Proveedor: ', bold: true },
                                `${reception.provider?.name || 'N/A'}\n`,
                                { text: 'Registrado por: ', bold: true },
                                `${reception.user.name}\n`,
                            ],
                        },
                    ],
                    style: 'infoBlock',
                    margin: [0, 10, 0, 5]
                },
                {
                    table: {
                        body: [
                            [
                                {
                                    text: `Estado: ${reception.status}`,
                                    fillColor: reception.status === 'COMPLETED' ? '#22c55e' : '#ef4444',
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
                    margin: [200, 0, 200, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: itemsTableBody,
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex % 2 === 0) ? '#F3F4F6' : null;
                        },
                        hLineWidth: () => 0,
                        vLineWidth: () => 0,
                    },
                    style: 'itemsTable'
                }
            ]
        });
    });

    if (receptions.length > 0) {
        content.push({ text: '', pageBreak: 'before' });

        content.push({
            stack: [
                { text: 'Resumen General del Reporte', style: 'header', alignment: 'center', margin: [0, 20, 0, 40] },
                {
                    table: {
                        headerRows: 0,
                        widths: ['*', 'auto'],
                        body: [
                            [
                                { text: 'Costo Total de Todas las Recepciones', style: 'totalLabel', alignment: 'right' },
                                { text: formatCurrency(totalReceptionsCost), style: 'totalValue', alignment: 'right' },
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 30, 0, 20]
                },
                {
                    text: `Total de recepciones procesadas en el periodo: ${receptions.length}`,
                    alignment: 'center',
                    style: 'infoBlock',
                    margin: [0, 20, 0, 0]
                }
            ]
        });
    }


    const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        header: {
            stack: [
                { text: storeName, style: 'header', alignment: 'center' },
                { text: 'Reporte de Recepciones por Rango de Fechas', style: 'documentTitle', alignment: 'center' },
                { text: `Desde: ${startDate.toLocaleDateString('es-ES')} - Hasta: ${endDate.toLocaleDateString('es-ES')}`, style: 'documentTitle', alignment: 'center' },
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

        content: content,

        styles: {
            header: { fontSize: 24, bold: true, color: '#111827' },
            documentTitle: { fontSize: 12, color: '#6B7280' },
            infoBlock: { fontSize: 10, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 14, bold: true, color: '#374151' },
            itemsTable: { margin: [0, 5, 0, 15], fontSize: 10 },
            tableHeader: { bold: true, fontSize: 11, color: '#1F2937', margin: [0, 5, 0, 5] },
            totalLabel: { fontSize: 14, bold: true, color: '#1F2937' },
            totalValue: { fontSize: 14, bold: true, color: '#1F2937' },
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

    async generateAdjustmentReportRange(adjustments: AdjustmentWithStore[], startDate: Date, endDate: Date, storeName: string): Promise<Buffer> {
        let totalAdjustmentsImpact = 0;
        const content: TDocumentDefinitions['content'] = [];
    
        adjustments.forEach((adjustment, index) => {
            let adjustmentImpact = 0;
    
            const itemsTableBody = [
                [
                    { text: 'Producto', style: 'tableHeader' },
                    { text: 'Condición', style: 'tableHeader', alignment: 'center' },
                    { text: 'Cantidad Ajustada', style: 'tableHeader', alignment: 'center' },
                    { text: 'Costo Unitario', style: 'tableHeader', alignment: 'right' },
                    { text: 'Impacto', style: 'tableHeader', alignment: 'right' },
                ],
    
                ...adjustment.items.map(item => {
                    const cost = Number(item.product.w_ficha.cost);
                    const quantity = Number(item.quantity);
                    const subtotal = quantity * cost;
                    adjustmentImpact += subtotal;
    
                    const valueStyle = quantity < 0 ? 'negativeValue' : 'positiveValue';
    
                    return [
                        item.product.name,
                        { text: item.product.w_ficha.condition, alignment: 'center' },
                        { text: quantity.toString(), alignment: 'center', style: valueStyle },
                        { text: formatCurrency(cost), alignment: 'right' },
                        { text: formatCurrency(subtotal), alignment: 'right', style: valueStyle },
                    ];
                }),
    
                [
                    { text: 'Impacto Total del Ajuste', colSpan: 4, alignment: 'right', bold: true, style: 'tableHeader' },
                    {},
                    {},
                    {},
                    { text: formatCurrency(adjustmentImpact), alignment: 'right', bold: true, style: adjustmentImpact < 0 ? 'negativeValue' : 'positiveValue' },
                ]
            ];
            totalAdjustmentsImpact += adjustmentImpact;
    
            if (index > 0) {
                content.push({ text: '', pageBreak: 'before' });
            }
            content.push({
                stack: [
                    {
                        columns: [
                            {
                                width: '50%',
                                text: [
                                    { text: 'Ajuste ID: ', bold: true },
                                    `${adjustment.id}\n`,
                                    { text: 'Fecha: ', bold: true },
                                    `${new Date(adjustment.adjustment_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}\n`,
                                ],
                            },
                            {
                                width: '50%',
                                text: [
                                    { text: 'Realizado por: ', bold: true },
                                    `${adjustment.user.name}\n`,
                                ],
                            },
                        ],
                        style: 'infoBlock',
                        margin: [0, 10, 0, 5]
                    },
                    {
                        text: [
                            { text: 'Motivo del Ajuste: ', bold: true },
                            adjustment.reason
                        ],
                        style: 'subheader',
                        margin: [0, 10, 0, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                            body: itemsTableBody,
                        },
                        layout: {
                            fillColor: function (rowIndex) {
                                return (rowIndex % 2 === 0) ? '#F3F4F6' : null;
                            },
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                        },
                        style: 'itemsTable'
                    },
                     {
                        text: 'Notas Adicionales',
                        style: 'subheader',
                        margin: [0, 20, 0, 5],
                    },
                    {
                        text: adjustment.notes || 'No se registraron notas adicionales.',
                        style: 'notesText',
                    }
                ]
            });
        });
    
        if (adjustments.length > 0) {
            content.push({ text: '', pageBreak: 'before' });
            content.push({
                stack: [
                    { text: 'Resumen General de Ajustes', style: 'header', alignment: 'center', margin: [0, 20, 0, 40] },
                    {
                        table: {
                            headerRows: 0,
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'Impacto Financiero Total (Pérdida)', style: 'totalLabel', alignment: 'right' },
                                    { text: formatCurrency(totalAdjustmentsImpact), style: ['totalValue', totalAdjustmentsImpact < 0 ? 'negativeValue' : 'positiveValue'], alignment: 'right' },
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 30, 0, 20]
                    },
                    {
                        text: `Total de ajustes procesados en el periodo: ${adjustments.length}`,
                        alignment: 'center',
                        style: 'infoBlock',
                        margin: [0, 20, 0, 0]
                    }
                ]
            });
        }
    
        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 80, 40, 60],
            header: {
                stack: [
                    { text: storeName, style: 'header', alignment: 'center' },
                    { text: 'Reporte de Ajustes de Inventario', style: 'documentTitle', alignment: 'center' },
                    { text: `Desde: ${startDate.toLocaleDateString('es-ES')} - Hasta: ${endDate.toLocaleDateString('es-ES')}`, style: 'documentTitle', alignment: 'center' },
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
    
            content: content,
    
            styles: {
                header: { fontSize: 24, bold: true, color: '#111827' },
                documentTitle: { fontSize: 12, color: '#6B7280' },
                infoBlock: { fontSize: 10, margin: [0, 0, 0, 10] },
                subheader: { fontSize: 14, bold: true, color: '#374151', margin: [0, 5, 0, 5] },
                itemsTable: { margin: [0, 5, 0, 15], fontSize: 10 },
                tableHeader: { bold: true, fontSize: 11, color: '#1F2937', margin: [0, 5, 0, 5] },
                totalLabel: { fontSize: 14, bold: true, color: '#1F2937' },
                totalValue: { fontSize: 14, bold: true },
                notesText: { font: 'Onest', color: '#4B5563', fontSize: 10 },
                footer: { fontSize: 8, color: 'grey' },
                positiveValue: { color: '#166534' },
                negativeValue: { color: '#b91c1c' }
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
