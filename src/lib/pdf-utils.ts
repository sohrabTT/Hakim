'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generateDietPDF = async (patientName: string, dietData: any, type: 'preOp' | 'postOp') => {
  const element = document.getElementById(`diet-plan-${type}`)
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    // Header
    pdf.setFillColor(34, 197, 94) // green-500
    pdf.rect(0, 0, pdfWidth, 20, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    // Note: Standard jsPDF doesn't support Farsi fonts out of the box. 
    // For a real production app, we would need to add a custom VFS font.
    // For now, we rely on the html2canvas capture which preserves the Farsi text as an image.
    
    let heightLeft = pdfHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight - 20)
    heightLeft -= (pdf.internal.pageSize.getHeight() - 20)

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position + 20, pdfWidth, pdfHeight - 20)
      heightLeft -= pdf.internal.pageSize.getHeight()
    }

    pdf.save(`Diet-Plan-${patientName}-${type}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
