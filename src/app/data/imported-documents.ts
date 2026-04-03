import { Manuscript } from '../models/document.model';

export const importedDocuments: Manuscript[] = [
  {
    id: 1,
    title: "แก้จำนวนสินค้าขนใน LE มากเกินจริง",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคสที่จำนวนสินค้าขนใน LE มากกว่าความจริง\n\nขั้นตอน\n1. ไปที่ `OTCInterface -> ItemInventory`\n2. ค้นหาด้วย\n\n```json\n{ \"otcpurchaseordernumber\": \"<REDACTED_ID>\", \"productcode\": \"<REDACTED_ID>\" }\n```\n\n3. ปรับค่าคงเหลือเป็น `0`\n- `quantityremaining`\n- `quantityremainingapproved`\n- `amountremaining`\n- `discountamountremaining`\n- `vatamountremaining`\n\n4. ไปที่ `aftersales_prod -> sales_order_items`\n5. ค้นหาด้วย\n\n```json\n{ \"purchase_order.number\": \"<REDACTED_ID>\", \"product.code\": \"<REDACTED_ID>\" }\n```\n\n6. ปรับค่าคงเหลือเป็น `0`\n- `quantity.remaining`\n- `amount.remaining`\n- `discount_amount.remaining`\n- `vat_amount.remaining`\n\nหมายเหตุ\n- ถ้า `original` เท่ากับ `remaining` อยู่แล้ว ไม่ต้องแก้ไข",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้จำนวนสินค้าขนใน LE มากเกินจริง.txt"
  },
  {
    id: 2,
    title: "แก้รายงาน Excel ไม่มีค่า SALE CNDN DELIVDOC",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคส export report แล้วคอลัมน์ `SALE/CNDN_DELIVDOC` ใน Excel ไม่มีค่า\n\nตรวจฝั่ง OTC Sale Staging\n```sql\nSELECT *\nFROM TB_FTD_LE_Order_TransportOrders\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportOrders\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_FTD_LE_Order\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_FTD_LE_Order_TransportProducts\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```\n\nตรวจฝั่ง RPT Sale OR\n```sql\nSELECT DOId\nFROM RPT_OTC_Transport_Detail\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM RPT_OTC_Transport_Detail_LE\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้รายงาน Excel ไม่มีค่า SALE CNDN DELIVDOC.txt"
  },
  {
    id: 3,
    title: "แก้เลข TO ไม่แสดงใน LE",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ตรวจเคสที่เลข `TO` ไม่แสดงใน LE\n\nขั้นตอน\n1. ไปที่ฐาน `OTC_SALE_STAGING`\n2. ตรวจข้อมูลในตาราง `TB_FTD_LE_Order_TransportOrders`\n\n```sql\nSELECT *\nFROM TB_FTD_LE_Order_TransportOrders\nWHERE LEDocumentNumber = '<REDACTED_ID>'\n```\n\n3. ตรวจสถานะ `T/O`\n4. ถ้าข้อมูลยังไม่ครบ ให้ reproduce `LE DocInfo` อีกครั้ง",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้เลข TO ไม่แสดงใน LE.txt"
  },
  {
    id: 4,
    title: "แก้เอกสารขนไม่มาและยังค้างขน",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคสเอกสารขนไม่ถูกสร้าง แต่รายงานยังแสดงสถานะค้างขน\n\nขั้นตอน\n1. ตรวจข้อมูลในรายงานก่อน\n\n```sql\nSELECT *\nFROM RPT_OTC_Transport_Detail\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM RPT_OTC_Transport_Detail_LE\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```\n\n2. ไล่ produce message ซ้ำจาก 3 topic นี้ตามลำดับ\n- `ftd-trp-le.tostatus`\n- `ftd-logisticsexecution-le-document-approved`\n- `ftd-logisticsexecution-updatedeliveryorder`\n\n3. ในแต่ละ topic ให้คัดลอก message ที่สถานะ `COMPLETED` แล้ว `ADD Message` กลับเข้าไป\n4. ตรวจ `TRId` จาก topic `ftd-trp-le.tostatus`\n\n5. ตรวจและอัปเดต `TRId` ใน LE staging\n\n```sql\nSELECT *\nFROM TB_FTD_LE_Order\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order\nSET TRId = '<REDACTED_ID>'\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```\n\n6. ถ้า `DA_Sync_Date` เกิน 1 ชั่วโมง ให้รีเฟรชใหม่\n\n```sql\nUPDATE TB_FTD_LE_Order\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_Items\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportOrders\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportProducts\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order\nSET DA_Sync_Date = DATEADD(DAY, -1, GETDATE())\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_Items\nSET DA_Sync_Date = DATEADD(DAY, -1, GETDATE())\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportOrders\nSET DA_Sync_Date = DATEADD(DAY, -1, GETDATE())\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportProducts\nSET DA_Sync_Date = DATEADD(DAY, -1, GETDATE())\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```\n\n7. ตรวจเคสอื่นที่เกี่ยวข้องเพิ่มเติม\n\n```sql\nSELECT *\nFROM TB_FTD_LE_Order\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_FTD_LE_Order_Items\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_FTD_LE_Order_TransportOrders\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_FTD_LE_Order_TransportProducts\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_FTD_LE_Order\nWHERE LEDocumentNumber IN ('<REDACTED_ID>', '<REDACTED_ID>');\n\nSELECT *\nFROM TB_FTD_LE_Order_Items\nWHERE LEDocumentNumber IN ('<REDACTED_ID>', '<REDACTED_ID>');\n\nSELECT *\nFROM TB_FTD_LE_Order_TransportOrders\nWHERE LEDocumentNumber IN ('<REDACTED_ID>', '<REDACTED_ID>');\n\nSELECT *\nFROM TB_FTD_LE_Order_TransportProducts\nWHERE LEDocumentNumber IN ('<REDACTED_ID>', '<REDACTED_ID>');\n\nSELECT *\nFROM RPT_Sales_OR.dbo.RPT_OTC_Transport_Detail\nWHERE LEDocumentNumber IN ('<REDACTED_ID>', '<REDACTED_ID>');\n\nSELECT *\nFROM RPT_Sales_OR.dbo.RPT_OTC_Transport_Detail_LE\nWHERE LEDocumentNumber IN ('<REDACTED_ID>', '<REDACTED_ID>');\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้เอกสารขนไม่มาและยังค้างขน.txt"
  },
  {
    id: 5,
    title: "แก้เอกสารค้างขนหลัง Assign ครบ",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้บันทึกเคสที่เอกสารถูก assign ครบแล้ว แต่ยังไม่เข้ารายการเอกสารค้างขน\n\nหมายเหตุ\n- ไฟล์เดิมยังไม่มีรายละเอียดขั้นตอน\n- ถ้าจะใช้งานจริง ควรเพิ่มเลขเอกสารตัวอย่าง, ตารางที่ต้องตรวจ, topic ที่เกี่ยวข้อง และวิธีแก้ไข",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้เอกสารค้างขนหลัง Assign ครบ.txt"
  },
  {
    id: 6,
    title: "แก้ AFS Error ไม่พบ Sale Office และ Sale Group",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nแก้เคส `aftersale` แจ้ง error ว่าไม่พบ `sale office` หรือ `sale group`\n\nขั้นตอน\n1. ไปที่ AFS แล้วค้นหา document จาก `_id`\n2. ตรวจค่าฟิลด์ `company`, `customer`, `branch`, `sale_area`, `sale_office`\n3. ค้นหาข้อมูลลูกค้าเดียวกันใน AFS\n4. ค้นหาข้อมูลลูกค้าเดียวกันใน LE environment เดียวกัน\n5. คัดลอกค่า `company`, `customer`, `branch`, `sale_area`, `sale_office` จาก LE\n6. map ค่าไปที่ customer ฝั่ง AFS\n7. map ค่าเดียวกันกลับเข้า document ที่มีปัญหา",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้ AFS Error ไม่พบ Sale Office และ Sale Group.txt"
  },
  {
    id: 7,
    title: "แก้ DocumentInfo ไม่มี transportOrders",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคสที่ `DocumentInfo.transportOrders` เป็น array ว่าง\n\nขั้นตอนตรวจสอบ\n1. ไปที่ event `internal.example.com`\n2. ค้นหาจากเลข LE แล้วดูว่ามี `duplicate error` หรือไม่\n3. ไปที่ topic `ftd-trp-le.tostatus` แล้วค้นหาเลข LE เดิม\n4. ไปที่ฐาน `LastMileInterface` ในระบบ `LE_PROD`\n5. ที่ collection `TRPTOM-Interfaces` ให้ลบข้อมูลซ้ำที่มี `transportOrder` เป็น `null`\n6. ไปที่ฐาน `LogisticExecution` ในระบบ `LE_PROD`\n7. ที่ collection `OrderTracking` ให้ลบข้อมูลซ้ำที่มี `transportOrder` เป็น `null`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้ DocumentInfo ไม่มี transportOrders.txt"
  },
  {
    id: 8,
    title: "แก้ OTCSale FIDoc หายตอนยกเลิก",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคส `FIDoc` หายระหว่างยกเลิกรายการใน OTCSale\n\n1. ตรวจรายการที่มีปัญหา\n\n```sql\nSELECT *\nFROM [OTCSale].[dbo].[TB_OTC_PurchaseOrders]\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\n2. อัปเดตค่าชั่วคราว แล้วรอให้ `SapError` เปลี่ยนเป็น `CancelSD`\n\n```sql\nUPDATE TB_OTC_PurchaseOrders\nSET FIDoc = '<REDACTED_ID>',\n    SDDoc = '<REDACTED_ID>',\n    BillingDoc = '<REDACTED_ID>',\n    SaleFIDoc = '<REDACTED_ID>',\n    SapError = 'CancelFI',\n    SapTransactionStatus = 2\nWHERE InvoiceDocNo = '<REDACTED_ID>'\n```\n\n3. จากนั้นอัปเดตค่ากลับตามเอกสารใหม่\n\n```sql\nUPDATE TB_OTC_PurchaseOrders\nSET FIDoc = '<REDACTED_ID>',\n    SDDoc = '<REDACTED_ID>',\n    BillingDoc = '<REDACTED_ID>',\n    SaleFIDoc = '<REDACTED_ID>',\n    SapError = NULL,\n    SapTransactionStatus = 1\nWHERE InvoiceDocNo = '<REDACTED_ID>'\n```\n\nหมายเหตุ\n- ถ้าเลยเวลาที่ระบบกำหนด ต้องยิง `sap retry` แบบ manual\n- ให้ produce ข้อมูลไปที่ topic `sap-interface` แล้วรอ `sap-response` กลับมา",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้ OTCSale FIDoc หายตอนยกเลิก.txt"
  },
  {
    id: 9,
    title: "แก้ SALE CNDN DELIVDOC ไม่ขึ้นในรายงาน",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคส `SALE/CNDN_DELIVDOC` ไม่แสดงในรายงาน\n\nขั้นตอน\n1. ไปที่ MongoDB (PROD) collection `OTC_INTERFACE.SaleOrders`\n2. ค้นหาด้วย `{otcpurchaseordernumber: \"<REDACTED_ID>\"}`\n3. ตรวจว่า `saleorderno` ว่างหรือไม่\n4. ไปที่ SQL Server ฝั่ง PROD แล้วตรวจ `TB_OTC_PurchaseOrders`\n\n```sql\nSELECT *\nFROM TB_OTC_PurchaseOrders\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\n5. คัดลอกค่า `SDDoc`\n6. นำค่า `SDDoc` ไปใส่ที่ field `saleorderno` ใน `OTC_INTERFACE.SaleOrders`\n7. ตรวจ `orderpaymentdocno` ถ้ามี ให้คัดลอกไปใส่ทั้ง `OTC_INTERFACE.SaleOrders.orderpaymentdocno` และ `ItemsInventory`\n8. ไปที่ `DocumentInfo` และ `transportOrders.do` แล้วอัปเดตวันที่ใหม่\n9. ตัวอย่างค่าที่ต้องตรวจ\n\n```json\n\"do\": {\n  \"id\": \"<REDACTED_ID>\",\n  \"status\": {\n    \"code\": \"SAP_ERROR\",\n    \"name\": \"SAP ไม่สำเร็จ\"\n  },\n  \"state\": \"SAPCreateError\"\n},\n\"expiresapretrycreatedate\": {\n  \"$date\": \"<REDACTED_ID>:00:00.000Z\"\n}\n```\n\n10. กลับไปตรวจผลที่หน้าเว็บ",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้ SALE CNDN DELIVDOC ไม่ขึ้นในรายงาน.txt"
  },
  {
    id: 10,
    title: "แก้ SAP สร้างข้อมูลซ้ำ",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคส SAP ตีกลับหรือสร้างข้อมูลซ้ำใน `PurchaseOrders`\n\n1. ตรวจข้อมูลปัจจุบัน\n\n```sql\nSELECT PurchaseNo,\n       PurchaseOrderId,\n       InvoiceDocNo,\n       SDDoc,\n       FIDoc,\n       BillingDoc,\n       SaleFIDoc,\n       CompanyName\nFROM [OTCSale].[dbo].[TB_OTC_PurchaseOrders]\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\n2. เคลียร์เลขเอกสาร SAP เดิม\n\n```sql\nUPDATE [OTCSale].[dbo].[TB_OTC_PurchaseOrders]\nSET SDDoc = '',\n    FIDoc = '',\n    BillingDoc = '',\n    SaleFIDoc = ''\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\n3. ปรับสถานะให้พร้อม retry\n\n```sql\nUPDATE TB_OTC_PurchaseOrders\nSET SapError = 'CancelFI',\n    SapTransactionStatus = 2\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\n4. เรียก OTCSale API `sapretry`\n5. รอผลจาก SAP retry\n\n6. ใส่ค่าเอกสารใหม่กลับเข้าไป\n\n```sql\nUPDATE [OTCSale].[dbo].[TB_OTC_PurchaseOrders]\nSET InvoiceDocNo = '<REDACTED_ID>',\n    FIDoc = NULL,\n    SDDoc = '<REDACTED_ID>',\n    BillingDoc = '<REDACTED_ID>',\n    SaleFIDoc = '<REDACTED_ID>'\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\n7. ปรับสถานะให้เคลียร์\n\n```sql\nUPDATE TB_OTC_PurchaseOrders\nSET SapError = 'ClearFI',\n    SapTransactionStatus = 2,\n    CancelStatus = NULL\nWHERE PurchaseNo = '<REDACTED_ID>'\n```\n\nหมายเหตุ\n- ก่อนแก้ไขควรตรวจ log ใน MongoDB collection `LogSapResponseCreatePayment` และ `LogSapResponseCreateSaleOrder`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้ SAP สร้างข้อมูลซ้ำ.txt"
  },
  {
    id: 11,
    title: "แก้ TRId หายที่ LE",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้แก้เคส `TRId` หายที่ LE และต้อง sync กลับไปยังรายงาน\n\nขั้นตอน\n1. ไปที่ Kafdrop\n2. เปิด topic `ftd-trp-le.tostatus`\n3. ค้นหาเลข LE `<REDACTED_ID>`\n4. คัดลอกค่า `trNo`\n\n5. ไปที่ `LastMileInterface -> TRPTOM-Interfaces`\n6. ค้นหา `{ \"platform.referentid\": \"<REDACTED_ID>\" }`\n7. ตรวจว่าสถานะเป็น `complete`\n8. แทนค่า `internal.example.com` ด้วย `trNo` ที่คัดลอกมา\n\n9. ไปที่ `OTCInterface -> DocumentInfo`\n10. ค้นหา `{ \"platform.referentid\": \"<REDACTED_ID>\" }`\n11. ตรวจว่าสถานะเป็น `complete`\n12. แทนค่า `internal.example.com` ด้วย `trNo` เดิม\n\n13. ไปที่ `LogisticExecution -> OrderTracking`\n14. ค้นหา `{ \"ledocumentnumber\": \"<REDACTED_ID>\" }`\n15. แทนค่า `trid` ด้วย `trNo`\n\n16. ตรวจรายงาน\n\n```sql\nSELECT *\nFROM RPT_OTC_Transport_Detail\nWHERE LEDocumentNumber = '<REDACTED_ID>'\n```\n\n17. ตรวจและอัปเดต `TRId` ใน staging\n\n```sql\nSELECT *\nFROM TB_FTD_LE_Order\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order\nSET TRId = '<REDACTED_ID>'\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```\n\n18. ถ้า `DA_Sync_Date` เกิน 1 ชั่วโมง ให้รีเฟรชใหม่\n\n```sql\nUPDATE TB_FTD_LE_Order\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_Items\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportOrders\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportProducts\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```\n\n19. รอ job ประมาณทุก 10 นาที\n20. ตรวจผลในตารางรายงานทั้งสองตัว\n\n```sql\nSELECT *\nFROM RPT_OTC_Transport_Detail\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nSELECT *\nFROM RPT_OTC_Transport_Detail_LE\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "แก้ TRId หายที่ LE.txt"
  },
  {
    id: 12,
    title: "ขั้นตอน Sap Retry ฝั่ง Aftersale",
    category: "Imported / Text",
    content: "หมายเหตุ\nไฟล์นี้ยังไม่มีรายละเอียดขั้นตอนของเคส `sapretry` ฝั่ง Aftersale\n\nสิ่งที่ควรเพิ่มภายหลัง\n1. เลขเอกสารตัวอย่าง\n2. ตารางหรือ collection ที่ต้องตรวจ\n3. API หรือ topic ที่ต้องยิงซ้ำ\n4. วิธีตรวจผลหลัง retry",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "ขั้นตอน Sap Retry ฝั่ง Aftersale.txt"
  },
  {
    id: 13,
    title: "โค้ดเปลี่ยนการแสดงผลหน้า LE ตามสถานะ",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nโค้ดนี้ใช้ควบคุมการซ่อนหรือแสดงคอลัมน์ในหน้า LE ตามสถานะเอกสาร\n\nสรุป logic\n- ถ้าสถานะไม่ใช่ `Approved` และไม่ใช่ `Canceled` จะซ่อน `TOStatus`, `TOId`, `TODate`, `DOId`\n- ถ้าสถานะไม่ใช่ `Approved` จะซ่อนคอลัมน์ `checkbox`\n- ถ้ามีสิทธิ์ `ApproveDocument`, มาจาก OMS และสถานะเป็น `WaitingForApprove` จะเปิด flow อนุมัติ\n\nโค้ด\n```js\nasync changeStatus(status = '') {\n    const lowerStatus = status.toLocaleLowerCase();\n\n    if (\n        lowerStatus != '' &&\n        lowerStatus != Status.Approved &&\n        lowerStatus != Status.Canceled\n    ) {\n        this.setColumnHide(['TOStatus', 'TOId', 'TODate', 'DOId'], true);\n    } else {\n        this.setColumnHide([], true);\n    }\n\n    if (\n        lowerStatus != Status.Approved &&\n        !!this.gridColumnApi?.getColumn('checkbox')?.isVisible()\n    ) {\n        this.setColumnHide(['checkbox'], true);\n    } else {\n        this.setColumnHide([], true);\n    }\n\n    if (\n        PermissionUtil.IsPermission(LEPermission.ApproveDocument) &&\n        this.ischeckSourceForOMS(this.docListTemp) &&\n        lowerStatus == Status.WaitingForApprove\n    ) {\n        this.setColumnHide([], true);\n        this.isPageStatusWaitingForApprove(lowerStatus);\n    } else {\n        this.isShowOnApprovedForOMS = false;\n    }\n    this.isPageStatusApproved(lowerStatus);\n\n    this.status = status.toLowerCase();\n    internal.example.com = 1;\n    this.currentPageChange(internal.example.com);\n}\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "โค้ดเปลี่ยนการแสดงผลหน้า LE ตามสถานะ.txt"
  },
  {
    id: 14,
    title: "ดึงรายชื่อผู้ใช้และสิทธิ์ OTCSale",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nดึงรายชื่อผู้ใช้พร้อมสิทธิ์ของระบบ OTCSale\n\nSQL\n```sql\nSELECT c.Code,\n       c.[Name],\n       u.EmployeeId,\n       u.EmployeeTag,\n       CONCAT(u.FirstName, ' ', u.LastName) AS Name,\n       r.[Name]\nFROM TB_OTC_UserRoleCompany ur\nINNER JOIN TB_OTC_Company c\n    ON ur.CompanyId = c.CompanyId\nINNER JOIN TB_OTC_Role r\n    ON ur.RoleId = r.RoleId\nINNER JOIN TB_OTC_User u\n    ON ur.UserId = u.UserId\nORDER BY ur.CompanyId, u.EmployeeId\n```",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "ดึงรายชื่อผู้ใช้และสิทธิ์ OTCSale.txt"
  },
  {
    id: 15,
    title: "ดึงรายชื่อผู้ใช้และสิทธิ์ Reporting",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nดึงรายชื่อผู้ใช้พร้อม role ในระบบ Reporting\n\nSQL\n```sql\nSELECT R.RoleName,\n       U.EmployeeId,\n       U.ContactId,\n       CONCAT(U.FirstName, ' ', U.LastName) AS Name\nFROM TB_SYS_UserRole AS UR\nINNER JOIN TB_SYS_User AS U\n    ON UR.UserId = U.UserId\nINNER JOIN TB_SYS_Role AS R\n    ON R.RoleId = UR.RoleId\nORDER BY UR.RoleId, U.EmployeeId\n```",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "ดึงรายชื่อผู้ใช้และสิทธิ์ Reporting.txt"
  },
  {
    id: 16,
    title: "ตรวจและยกเลิกเงินทดรองรับ",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ตรวจและยกเลิกเงินทดรองรับ (`Cash Advance`)\n\nขั้นตอน\n1. ตรวจว่ามีการนำเลข `CashAdvanceNo` ไปใช้งานแล้วหรือไม่\n\n```sql\nSELECT *\nFROM TB_OTC_PurchaseOrderCashAdvance\nWHERE CashAdvanceNo = '';\n```\n\n2. ตรวจข้อมูลในตารางเงินทดรองก่อน\n\n```sql\nSELECT *\nFROM TB_OTC_CashAdvance\nWHERE CashAdvanceNo = '';\n```\n\n3. ถ้าตรวจครบแล้วและยืนยันว่าจะลบ ให้เปลี่ยน `SELECT` เป็น `DELETE`\n\nตัวอย่างเลขเอกสาร\n```sql\nSELECT *\nFROM TB_OTC_PurchaseOrderCashAdvance\nWHERE CashAdvanceNo = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_OTC_CashAdvance\nWHERE CashAdvanceNo = '<REDACTED_ID>';\n```\n\nหมายเหตุ\n- ตรวจความสัมพันธ์ของข้อมูลทุกครั้งก่อนลบจริง\n- ควรสำรองข้อมูลก่อนเปลี่ยนจาก `SELECT` เป็น `DELETE`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ตรวจและยกเลิกเงินทดรองรับ.txt"
  },
  {
    id: 17,
    title: "ตรวจ LE Type เป็น NULL",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ตรวจเคสที่ `TYPE` ของ LE เป็น `NULL`\n\nSQL ตรวจสอบ\n```sql\nSELECT *\nFROM TEMP_TB_FTD_LE_Order_TransportOrders_DO\nWHERE LEDocumentNumber = '<REDACTED_ID>'\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ตรวจ LE Type เป็น NULL.txt"
  },
  {
    id: 18,
    title: "ตรวจ OTCSale ค้างรอ SAP",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ตรวจเคสที่ OTCSale ค้างและยังไม่รับผลจาก SAP\n\nขั้นตอน\n1. ตรวจ log `LogCreatePayment` ใน OTC LOG (PROD)\n2. filter ด้วย `{OrderNumber: '<REDACTED_ID>'}`\n3. ตรวจ log `LogCreateSaleOrder` ใน OTC LOG (PROD)\n4. filter ด้วย `{OrderNumber: '<REDACTED_ID>'}`\n5. เปิด Kafka topic `https://internal.example.com/topic/otc-otcsale-sap-interface`\n6. filter เลข `<REDACTED_ID>`\n7. เปิด Kafka topic `https://internal.example.com/topic/otc-otcsale-sap-response`\n8. filter เลข `<REDACTED_ID>`\n9. ถ้ายังไม่พบข้อมูลจาก `sap-response` ให้ produce message ซ้ำที่ topic `otc-otcsale-sap-interface`\n10. ตรวจผลต่อที่ฝั่ง `OTP` และ `LE`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ตรวจ OTCSale ค้างรอ SAP.txt"
  },
  {
    id: 19,
    title: "ตรวจ OTCSale ไม่ Produce ข้อมูล",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nตรวจว่า order ถูก produce ออกครบทุก topic หรือไม่\n\nขั้นตอน\n1. เปิด Kafdrop topic `otc-otcsale-order`\n2. ค้นหา `otcpurchasenumber` = `<REDACTED_ID>`\n3. เปิด topic `otc-otcsale-sap-interface`\n4. ค้นหาเลขเดิมอีกครั้ง\n5. เปิด topic `otc-otcsale-sap-response`\n6. ค้นหาเลขเดิมซ้ำอีกรอบ\n7. ถ้าไม่พบในบาง topic ให้ไล่ต่อว่าขั้นตอนไหนไม่ produce",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ตรวจ OTCSale ไม่ Produce ข้อมูล.txt"
  },
  {
    id: 20,
    title: "ตัวอย่าง Payload PO สำหรับตรวจบั๊ก",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ payload นี้สำหรับ reproduce หรือไล่ตรวจบั๊กของ `Purchase Order`\n\nตัวอย่าง payload\n```json\n{\n  \"channelId\": \"1\",\n  \"customerId\": 4907,\n  \"customerCode\": \"<REDACTED_ID>\",\n  \"customerName\": \"<REDACTED_TEXT>\",\n  \"customerTypeName\": \"Agent /Sub-Agent\",\n  \"soldToAddress\": \"<REDACTED_ADDRESS>\",\n  \"orderDate\": \"<REDACTED_ID>\",\n  \"saleTypeId\": 1,\n  \"amountExcludeVat\": 988145.79,\n  \"discountAmountIncludeVat\": 0,\n  \"vatAmount\": 69170.21,\n  \"netAmountIncludeVat\": 1057316,\n  \"netAmountExcludeVat\": 988145.79,\n  \"roundedNetAmountIncludeVat\": 1057316,\n  \"shipToName\": \"<REDACTED_TEXT>\",\n  \"shipToPhoneNo\": null,\n  \"shipToAddress\": \"<REDACTED_ADDRESS>\",\n  \"shipToCustRefAddress\": \"<REDACTED_ADDRESS>\",\n  \"vatRate\": 0,\n  \"statusCode\": 10,\n  \"companyId\": 4,\n  \"branchId\": null,\n  \"isCompensate\": false,\n  \"saleEmployeeId\": 37,\n  \"saleEmployeeName\": \"<REDACTED_TEXT>\",\n  \"saleOwnerEmployeeId\": \"<REDACTED_ID>\",\n  \"companySaleGroupId\": 70,\n  \"companySaleGroupCode\": \"070\",\n  \"customerSaleGroupId\": 70,\n  \"items\": [\n    {\n      \"purchaseOrderItemId\": 0,\n      \"productId\": 103869,\n      \"productCode\": \"<REDACTED_ID>\",\n      \"productName\": \"เบียร์ช้างคลาสสิกขวด 620 ซีซี. 4.8ดีกรี S12\",\n      \"quantity\": 1436,\n      \"skuId\": 363332,\n      \"unitPriceExcludeVat\": 589.72,\n      \"unitPriceIncludeVat\": 631,\n      \"amountIncludeVat\": 906116,\n      \"discountValue\": 0,\n      \"discountKey\": \"0\",\n      \"netAmountIncludeVat\": 906116,\n      \"promotionApplied\": true,\n      \"vatAmount\": 59278.62,\n      \"discountType\": null,\n      \"unitId\": 5100,\n      \"parent\": 0,\n      \"sequenceNo\": 1,\n      \"promotionId\": null,\n      \"itemType\": 0,\n      \"netAmountExcludeVat\": 846837.38,\n      \"originalUnitPriceIncludeVat\": 631,\n      \"sapAmountExcludeVat\": 846837.38,\n      \"sapVatAmount\": 59278.62,\n      \"sapDiscountValue\": 0,\n      \"sapNetAmountExcludeVat\": 846837.38,\n      \"sapNetAmountIncludeVat\": 906116,\n      \"vatRate\": 7,\n      \"productListType\": \"A\"\n    },\n    {\n      \"purchaseOrderItemId\": 0,\n      \"productId\": 0,\n      \"productCode\": \"<REDACTED_ID>\",\n      \"productName\": \"เบียร์ช้างคลาสสิกขวด 620 ซีซี. 4.8ดีกรี S12\",\n      \"quantity\": 6,\n      \"skuId\": null,\n      \"unitPriceExcludeVat\": 0,\n      \"unitPriceIncludeVat\": 0,\n      \"amountIncludeVat\": 0,\n      \"discountValue\": 0,\n      \"discountKey\": \"0.00\",\n      \"netAmountIncludeVat\": 0,\n      \"promotionApplied\": true,\n      \"vatAmount\": 0,\n      \"discountType\": null,\n      \"unitId\": 5100,\n      \"parent\": 1,\n      \"sequenceNo\": 2,\n      \"promotionId\": 4081,\n      \"itemType\": 1,\n      \"netAmountExcludeVat\": 0,\n      \"freeReasonCode\": 1,\n      \"sapAmountExcludeVat\": 0,\n      \"sapVatAmount\": 0,\n      \"sapDiscountValue\": 0,\n      \"sapNetAmountExcludeVat\": 0,\n      \"sapNetAmountIncludeVat\": 0,\n      \"vatRate\": 7\n    },\n    {\n      \"purchaseOrderItemId\": 0,\n      \"productId\": 93893,\n      \"productCode\": \"<REDACTED_ID>\",\n      \"productName\": \"เบียร์ช้างคลาสสิก Can 490 ซีซี. S15\",\n      \"quantity\": 224,\n      \"skuId\": 309013,\n      \"unitPriceExcludeVat\": 630.84,\n      \"unitPriceIncludeVat\": 675,\n      \"amountIncludeVat\": 151200,\n      \"discountValue\": 0,\n      \"discountKey\": \"0\",\n      \"netAmountIncludeVat\": 151200,\n      \"promotionApplied\": false,\n      \"vatAmount\": 9891.59,\n      \"discountType\": null,\n      \"unitId\": 5088,\n      \"parent\": 0,\n      \"sequenceNo\": 3,\n      \"promotionId\": null,\n      \"itemType\": 0,\n      \"netAmountExcludeVat\": 141308.41,\n      \"originalUnitPriceIncludeVat\": 675,\n      \"sapAmountExcludeVat\": 141308.41,\n      \"sapVatAmount\": 9891.59,\n      \"sapDiscountValue\": 0,\n      \"sapNetAmountExcludeVat\": 141308.41,\n      \"sapNetAmountIncludeVat\": 151200,\n      \"vatRate\": 7,\n      \"productListType\": \"A\"\n    }\n  ],\n  \"soldToCustRefAddress\": \"<REDACTED_ADDRESS>\",\n  \"usedPromotions\": [\n    {\n      \"purchaseOrderPromotionId\": 0,\n      \"purchaseOrderId\": 0,\n      \"privilegeId\": 3053,\n      \"promotionId\": 4081,\n      \"promotionName\": \"<REDACTED_TEXT>\",\n      \"use\": 3,\n      \"referenceItems\": [\n        1\n      ],\n      \"referenceBurnAmounts\": [\n        1380\n      ],\n      \"privilegeCode\": \"AG-SubEX-Beer_AllSKU(0925_2.2)\",\n      \"privilegeName\": \"<REDACTED_TEXT>\",\n      \"ioNumber\": \"<REDACTED_ID>\"\n    }\n  ],\n  \"dateConfigId\": 1,\n  \"paymentTermId\": \"R000\",\n  \"customerTypeId\": \"6\",\n  \"isPopPos\": false,\n  \"productGroupCode\": null,\n  \"saleOfficeCode\": \"074\",\n  \"saleOfficeName\": \"พระนครศรีอยุธยา\",\n  \"plantCode\": \"6011\",\n  \"summaryVatAmount\": 69170.21,\n  \"summaryNetAmountExcludeVat\": 988145.79\n}\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ตัวอย่าง Payload PO สำหรับตรวจบั๊ก.txt"
  },
  {
    id: 21,
    title: "ตารางเทียบ Region POM NUM",
    category: "Imported / Text",
    content: "ตารางเทียบรหัส Region\n\n| Region | POM | NUM |\n| --- | --- | --- |\n| R3 | 5800 | 6400 |\n| R4 | 6800 | 8700 |\n| R6 | 6000 | 6600 |\n| R7 | 6900 | 7900 |\n| R8 | 6100 | 6700 |",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "ตารางเทียบ Region POM NUM.txt"
  },
  {
    id: 22,
    title: "เปลี่ยนที่อยู่บริษัทใน LE AFS และ OTCSale",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ไฟล์นี้เมื่อต้องแก้ที่อยู่บริษัทให้ตรงกันใน `LE`, `AFS` และ `OTCSale`\n\nลำดับงาน\n1. ฝั่ง LE ใช้ข้อมูล `company`\n2. ฝั่ง AFS ใช้ข้อมูล `business_place`\n3. ฝั่ง OTCSale ตรวจข้อมูลบริษัทด้วย query ด้านล่าง\n4. เมื่อข้อมูลถูกต้องแล้ว ให้ update ฝั่ง LE\n5. จากนั้น update `business_place` ฝั่ง AFS\n6. ปิดท้ายด้วย update ข้อมูลบริษัทใน OTCSale\n\nSQL ตรวจข้อมูลบริษัท\n```sql\nSELECT [CompanyId]\n      ,[Name]\n      ,[Code]\n      ,[GroupCode]\n      ,[Address]\n      ,[FaxNumber]\n      ,[PhoneNumber]\n      ,[TaxId]\n      ,[RegionId]\n      ,[HCCompanyCode]\n      ,[MinorSupplierCode]\n      ,[CreatedBy]\n      ,[CreatedDate]\n      ,[UpdatedBy]\n      ,[UpdatedDate]\n      ,[SapArCode]\n      ,[Building]\n      ,[District]\n      ,[Floor]\n      ,[HouseNo]\n      ,[Moo]\n      ,[Postcode]\n      ,[Province]\n      ,[Road]\n      ,[Room]\n      ,[Soi]\n      ,[SubDistrict]\n      ,[VillageName]\n      ,[BusinessPlaceCode]\n      ,[BusinessPlaceNameEn]\n      ,[BusinessPlaceNameTh]\n      ,[CompanyCodeBMS]\nFROM [OTCSale].[dbo].[TB_OTC_Company]\nWHERE Code = '5900'\n```\n\nหมายเหตุ\n- ที่อยู่ตัวอย่างของเคสนี้คือ `<REDACTED_ADDRESS>`\n- คำสั่ง `UPDATE` ให้เขียนตามข้อมูลจริงของแต่ละเคส",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เปลี่ยนที่อยู่บริษัทใน LE AFS และ OTCSale.txt"
  },
  {
    id: 23,
    title: "เพิ่มผู้ใช้ใน OTC Web",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เพิ่มผู้ใช้ใน OTC Web และผูกสิทธิ์ที่เกี่ยวข้อง\n\nขั้นตอน\n1. ตรวจ role เดิมของผู้ใช้\n\n```sql\nSELECT *\nFROM TB_OTC_UserRoleCompany AS UR\nJOIN TB_OTC_User AS U\n    ON U.UserId = UR.UserId\nWHERE U.EmployeeId = '<REDACTED_ID>'\n```\n\n2. เพิ่มผู้ใช้เข้า OTCSale\n\n```sql\nDECLARE @Employee_Ids NVARCHAR(MAX);\nSET @Employee_Ids = <REDACTED_VALUE>;\n\nPRINT @Employee_Ids;\nEXEC [USP_AddUser_With_EmployeeId_To_OTCSale] @Employee_Ids;\n```\n\n3. ถ้าต้องเพิ่มสิทธิ์หลายบริษัทแบบ loop ให้ใช้ script นี้\n\n```sql\nDECLARE @EmployeeId NVARCHAR(10) = <REDACTED_VALUE>;\nDECLARE @CompanyId INT = <REDACTED_VALUE>;\nDECLARE @RoleId INT;\n\nWHILE @CompanyId <= 16\nBEGIN\n    SET @RoleId = <REDACTED_VALUE>;\n    WHILE @RoleId <= 16\n    BEGIN\n        EXEC [dbo].[USP_AddPermission_OTCSale] @EmployeeId, @CompanyId, @RoleId;\n        SET @RoleId = <REDACTED_VALUE>;\n    END;\n    SET @CompanyId = <REDACTED_VALUE>;\nEND;\n```\n\n4. เพิ่มข้อมูลฝั่ง AFS ที่ `omsap-migrate (afs)`\n5. คัดลอกผลไป insert ที่ `AFS -> user`\n6. คัดลอกผลไป insert ที่ `LE -> user`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เพิ่มผู้ใช้ใน OTC Web.txt"
  },
  {
    id: 24,
    title: "เพิ่มพนักงานขายใน OTCSale",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เพิ่ม `Sale Employee` เข้า OTCSale\n\nขั้นตอน\n1. ตรวจว่ามีพนักงานขายอยู่แล้วหรือไม่\n2. ถ้ายังไม่มี ให้เรียก stored procedure เพิ่มข้อมูล\n\nSQL\n```sql\nSELECT *\nFROM TB_OTC_SaleEmployee\nWHERE SaleEmployeeCode = '<REDACTED_ID>';\n\nDECLARE @Employee_Ids NVARCHAR(MAX);\nSET @Employee_Ids = <REDACTED_VALUE>;\n\nDECLARE @CompanyCode NVARCHAR(MAX);\nSET @CompanyCode = <REDACTED_VALUE>;\n\nEXEC [dbo].[USP_AddSaleEmployee] @Employee_Ids, @CompanyCode;\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เพิ่มพนักงานขายใน OTCSale.txt"
  },
  {
    id: 25,
    title: "เพิ่มสาขา Shopteenee ใน OTC Web",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เพิ่มสาขา `Shopteenee` ผ่านหน้า Decision Management ของ Logistic Execution\n\nลิงก์ที่ใช้\n- หน้า Landing: `https://internal.example.com/decisionmanagement/web/landing`\n- หน้า Decision Routing ให้ใช้ URL ที่ระบบออกให้ตามสิทธิ์ของผู้ใช้งาน\n\nขั้นตอน\n1. กดปุ่ม `Download Template` เพื่อดาวน์โหลดไฟล์ Excel\n2. แก้ไขไฟล์ Excel แล้วใส่ข้อมูลสาขาที่ต้องการเพิ่ม\n3. กดปุ่ม `Upload Store Code`\n4. กด `Download Store Code` เพื่อตรวจว่ารายการที่อัปโหลดเข้าครบหรือไม่\n5. ตรวจข้อมูลต่อที่ `logisticsexecution -> store`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เพิ่มสาขา Shopteenee ใน OTC Web.txt"
  },
  {
    id: 26,
    title: "เพิ่มสินค้าและราคาให้บริษัท",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ตรวจสินค้า, SKU, ราคา และเพิ่มสินค้าเข้า company/sale group\n\n1. ตรวจข้อมูลสินค้าและ SKU\n\n```sql\nSELECT *\nFROM TB_OTC_Product\nWHERE ProductCode = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_OTC_ProductList\nWHERE ProductId = '26664';\n\nSELECT SKUId, ProductId, s.UnitId, UnitCode, NameTH, NameEN\nFROM TB_OTC_SKU AS s\nJOIN TB_OTC_Unit AS u\n    ON u.UnitId = s.UnitId\nWHERE ProductId = '26664';\n```\n\n2. ตรวจราคาเดิมในแต่ละบริษัท\n\n```sql\nSELECT PriceId,\n       PriceTypeId,\n       sku.SKUId,\n       c.CompanyId,\n       c.Name,\n       sku.UnitId,\n       u.UnitCode,\n       u.NameTH,\n       u.NameEN\nFROM TB_OTC_Price AS p\nJOIN TB_OTC_Company AS c\n    ON c.CompanyId = p.CompanyId\nJOIN TB_OTC_SKU AS sku\n    ON p.SKUId = sku.SKUId\nJOIN TB_OTC_Unit AS u\n    ON sku.UnitId = u.UnitId\nWHERE p.SKUId IN ('<REDACTED_ID>', '<REDACTED_ID>', '<REDACTED_ID>', '<REDACTED_ID>', '<REDACTED_ID>');\n\nSELECT *\nFROM TB_OTC_Company;\n\nSELECT *\nFROM TB_OTC_ProductSale\nWHERE ProductCode = '<REDACTED_ID>';\n```\n\n3. ราคาตัวอย่างของเคสนี้\n- product code `<REDACTED_ID>`\n- sku `262561`\n  - VAT `460.5`, `466.5`\n  - No VAT `430.37`, `435.98`\n- sku `262565`\n  - VAT `38.38`, `41.13`\n  - No VAT `35.87`, `36.34`\n\n4. เพิ่มราคาให้แต่ละบริษัท\n\n```sql\nINSERT INTO TB_OTC_Price (CompanyId, PriceTypeId, SKUId, Price, PriceExVat)\nVALUES\n(6, 1, 262561, 460.5, 430.37),\n(6, 2, 262561, 466.5, 435.98),\n(6, 1, 262565, 38.38, 35.87),\n(6, 2, 262565, 38.88, 36.34),\n(7, 1, 262561, 460.5, 430.37),\n(7, 2, 262561, 466.5, 435.98),\n(7, 1, 262565, 38.38, 35.87),\n(7, 2, 262565, 41.13, 36.34),\n(8, 1, 262561, 460.5, 430.37),\n(8, 2, 262561, 466.5, 435.98),\n(8, 1, 262565, 38.38, 35.87),\n(8, 2, 262565, 41.13, 36.34),\n(9, 1, 262561, 460.5, 430.37),\n(9, 2, 262561, 466.5, 435.98),\n(9, 1, 262565, 38.38, 35.87),\n(9, 2, 262565, 41.13, 36.34),\n(10, 1, 262561, 460.5, 430.37),\n(10, 2, 262561, 466.5, 435.98),\n(10, 1, 262565, 38.38, 35.87),\n(10, 2, 262565, 41.13, 36.34),\n(11, 1, 262561, 460.5, 430.37),\n(11, 2, 262561, 466.5, 435.98),\n(11, 1, 262565, 38.38, 35.87),\n(11, 2, 262565, 41.13, 36.34),\n(15, 1, 262561, 460.5, 430.37),\n(15, 2, 262561, 466.5, 435.98),\n(15, 1, 262565, 38.38, 35.87),\n(15, 2, 262565, 41.13, 36.34),\n(16, 1, 262561, 460.5, 430.37),\n(16, 2, 262561, 466.5, 435.98),\n(16, 1, 262565, 38.38, 35.87),\n(16, 2, 262565, 41.13, 36.34);\n```\n\n5. ผูกสินค้าเข้ากับทุก sale group\n\n```sql\nDECLARE @ProductId INT = <REDACTED_VALUE>;\nDECLARE @CreatedBy INT = <REDACTED_VALUE>;\nDECLARE @UpdatedBy INT = <REDACTED_VALUE>;\nDECLARE @ProductListType CHAR(1) = <REDACTED_VALUE>;\n\n;WITH SaleGroups AS (\n    SELECT 1 AS SaleGroupId\n    UNION ALL\n    SELECT SaleGroupId + 1\n    FROM SaleGroups\n    WHERE SaleGroupId < 94\n)\nINSERT INTO [OTCSale].[dbo].[TB_OTC_ProductList]\n    ([SaleGroupId], [ProductId], [CreatedBy], [CreatedDate], [UpdatedBy], [UpdatedDate], [ProductListType])\nSELECT SaleGroupId,\n       @ProductId,\n       @CreatedBy,\n       GETDATE(),\n       @UpdatedBy,\n       GETDATE(),\n       @ProductListType\nFROM SaleGroups\nOPTION (MAXRECURSION 100);\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เพิ่มสินค้าและราคาให้บริษัท.txt"
  },
  {
    id: 27,
    title: "เพิ่มหรือลบสิทธิ์ผู้ใช้ใน OTCSale",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เพิ่มหรือลบผู้ใช้และสิทธิ์ใน OTCSale รวมถึง MongoDB ฝั่ง AFS/LE\n\nข้อควรระวัง\n- ตรวจ `companyCode` ให้ถูกต้องก่อนเสมอ\n\nลบผู้ใช้\n1. ลบผู้ใช้จาก MongoDB ฝั่ง AFS ด้วย `employee_id`\n2. ลบผู้ใช้จาก MongoDB ฝั่ง LE ด้วย `employeeid`\n3. ตรวจ role ของผู้ใช้ใน SQL\n\n```sql\nSELECT *\nFROM TB_OTC_UserRoleCompany AS UR\nJOIN TB_OTC_User AS U\n    ON U.UserId = UR.UserId\nWHERE U.EmployeeId = '<REDACTED_ID>';\n\nSELECT *\nFROM TB_OTC_UserRoleCompany\nWHERE UserId = 533\n  AND CompanyId IN (3, 12);\n```\n\n4. ลบ role ของผู้ใช้ในบริษัทที่ต้องการ\n\n```sql\nDELETE\nFROM TB_OTC_UserRoleCompany\nWHERE UserId = 533\n  AND CompanyId IN (3, 12);\n```\n\n5. ตรวจผู้ใช้ในตารางหลักแล้วลบ\n\n```sql\nSELECT *\nFROM TB_OTC_User\nWHERE EmployeeId = '<REDACTED_ID>';\n\nDELETE\nFROM TB_OTC_User\nWHERE EmployeeId = '<REDACTED_ID>';\n```\n\nเพิ่มผู้ใช้\n1. ตรวจว่ามีผู้ใช้อยู่แล้วหรือไม่\n\n```sql\nSELECT *\nFROM TB_OTC_User\nWHERE EmployeeId = '<REDACTED_ID>';\n```\n\n2. ถ้ายังไม่มี ให้เพิ่มด้วย stored procedure\n\n```sql\nDECLARE @Employee_Ids NVARCHAR(MAX);\nSET @Employee_Ids = <REDACTED_VALUE>;\n\nPRINT @Employee_Ids;\nEXEC [USP_AddUser_With_EmployeeId_To_OTCSale] @Employee_Ids;\n```\n\n3. ถ้าต้องการเพิ่มสิทธิ์หลายบริษัทแบบ loop\n\n```sql\nDECLARE @EmployeeId NVARCHAR(10) = <REDACTED_VALUE>;\nDECLARE @CompanyId INT = <REDACTED_VALUE>;\nDECLARE @RoleId INT;\n\nWHILE @CompanyId <= 16\nBEGIN\n    SET @RoleId = <REDACTED_VALUE>;\n    WHILE @RoleId <= 16\n    BEGIN\n        EXEC [dbo].[USP_AddPermission_OTCSale] @EmployeeId, @CompanyId, @RoleId;\n        SET @RoleId = <REDACTED_VALUE>;\n    END;\n    SET @CompanyId = <REDACTED_VALUE>;\nEND;\n```\n\nเพิ่ม role รายบริษัท\n```sql\nDECLARE @EmployeeId NVARCHAR(10) = <REDACTED_VALUE>;\nDECLARE @CompanyId NVARCHAR(20) = <REDACTED_VALUE>;\nDECLARE @RoleId NVARCHAR(20) = <REDACTED_VALUE>;\n\nEXEC [dbo].[USP_AddPermission_OTCSale] @EmployeeId, @CompanyId, @RoleId;\n```\n\nลบ role ที่เพิ่มผิด\n```sql\nSELECT *\nFROM TB_OTC_UserRoleCompany\nWHERE UserId = 515\n  AND CompanyId IN (14);\n\n-- ใช้คำสั่งนี้เมื่อตรวจแล้วว่าถูกต้อง\n-- DELETE\n-- FROM TB_OTC_UserRoleCompany\n-- WHERE UserId = 515\n--   AND CompanyId IN (14);\n```\n\nตรวจ role หลังเพิ่ม\n```sql\nDECLARE @Company NVARCHAR(MAX);\nSET @Company = <REDACTED_VALUE>;\n\nEXEC [USP_Check_User_In_OTCSale] @Company, '<REDACTED_ID>';\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เพิ่มหรือลบสิทธิ์ผู้ใช้ใน OTCSale.txt"
  },
  {
    id: 28,
    title: "เพิ่ม Ship To",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เพิ่ม `Ship-To` ในระบบที่เกี่ยวข้อง\n\nขั้นตอน\n1. เปิด Postman\n2. เรียก token จาก LE core\n3. เรียก API `customersync` ของ SAP ด้วยรหัสลูกค้าที่ต้องการ\n4. เรียก API `CustomersSync` ของ OTCSale โดยใช้ token จาก OTC Web\n5. ตรวจข้อมูลที่บริษัทเป้าหมายทั้งใน OTCSale และ LE\n\nAPI ตัวอย่าง\n```text\nGET https://internal.example.com/api/v0/lecore/oauth/token/<client-id>/shopteenee\nGET https://internal.example.com/sap/api/v1/customersync/0005xxxxxx\nGET https://internal.example.com/sap/api/v1/customersync/0001xxxxxx\nGET http://internal.example.com/otcsellapi/v1/CustomersSync/0001xxxxxx\n```\n\nหมายเหตุ\n- ถ้าต้องแก้ข้อมูล `Ship-To` โดยตรง ให้ไปที่ SQL Server แล้วค้นในถัง `shipTo` ด้วย `CustomerCode`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "เพิ่ม Ship To.txt"
  },
  {
    id: 29,
    title: "ยกเลิก Purchase Order ด้วย API",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เรียก API ยกเลิก `Purchase Order` แบบ manual\n\nAPI\n- `v1/purchaseorder/cancel`\n\npayload ตัวอย่าง\n```json\n{\n  \"purchaseOrderId\": \"\",\n  \"remarkCancel\": \"\"\n}\n```",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "ยกเลิก Purchase Order ด้วย API.txt"
  },
  {
    id: 30,
    title: "ย้าย Docker Image ไป Harbor",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nย้าย image registry จาก `internal.example.com` ไป `internal.example.com`\n\nก่อนเริ่ม\n- ใช้ credential หรือ token ของ `dev k8s` ตาม environment จริง\n- ห้ามเก็บ token จริงไว้ในไฟล์เอกสาร\n\nรายการที่ต้อง replace\n- `internal.example.com` -> `internal.example.com`\n- `golang:version-alpine` -> `internal.example.com/baseimage/golang:1.23.3-alpine`\n- `alpine:latest` -> `internal.example.com/baseimage/alpine:3.22`\n- `gotestsum@latest` -> `gotestsum@v1.11.0`\n- `docker:dind` -> `internal.example.com/baseimage/docker:28.1.1-dind`\n\nจุดที่ต้องแก้\n1. `.gitlab-ci.yml`\n- `image: internal.example.com/baseimage/golang:1.23.3-alpine`\n- `go install gotest.tools/gotestsum@v1.11.0`\n\n2. `.gitlab-ci/build-tag/build-tag.yml`\n- `command: [\"--insecure-registry=internal.example.com\"]`\n- ตั้ง `IMAGE_NAME=$HARBOR_URL/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME`\n- `docker login -u $HARBOR_USER -p $HARBOR_SECRET $HARBOR_URL`\n- build, tag และ push ทั้ง `CI_COMMIT_TAG` และ `latest`\n\n3. `.gitlab-ci/build/build-dev.yml`\n- `command: [\"--insecure-registry=internal.example.com\"]`\n- ตั้ง `STAGE=dev`\n- ตั้ง `IMAGE_NAME=$HARBOR_URL/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME`\n- `docker login -u $HARBOR_USER -p $HARBOR_SECRET $HARBOR_URL`\n- build แล้ว push ทั้ง `latest` และ `CI_COMMIT_SHORT_SHA`\n\n4. `.gitlab-ci/deploy-prod/deploy-prod.yml`\n- `command: [\"--insecure-registry=internal.example.com\"]`\n\n5. `deployment/deployment.yml`\n- `image: $HARBOR_URL/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:${VER_TAG}`\n- `imagePullSecrets.name` ต้องตรงกับ namespace ที่ใช้งาน\n\n6. `deployment/deploymentk3s-prod.yml`\n- `image: $HARBOR_URL/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME:${VER_TAG}`\n- `imagePullSecrets.name` ต้องตรงกับ namespace ที่ใช้งาน\n\n7. `dockerfile/Dockerfile.app`\n- `FROM internal.example.com/baseimage/golang:1.23.3-alpine as builder`\n- `FROM internal.example.com/baseimage/golang:1.23.3-alpine`",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ย้าย Docker Image ไป Harbor.txt"
  },
  {
    id: 31,
    title: "ย้าย Git Remote และตรวจ URL",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้เปลี่ยน remote ของ GitLab และตรวจว่า URL ใหม่ถูกต้อง\n\nขั้นตอน\n1. ตรวจ remote เดิม\n\n```bash\ngit remote -v\n```\n\n2. เปลี่ยน URL ของ `origin`\n\n```bash\ngit remote set-url origin <url-new>\n```\n\n3. ตรวจอีกครั้งว่าเปลี่ยนแล้ว\n\n```bash\ngit remote -v\n```\n\n4. push ขึ้น remote ใหม่\n\n```bash\ngit push\n```\n\nหมายเหตุ\n- ถ้ามี library หรือ submodule ที่อ้าง URL เดิมอยู่ ให้แก้ภายในโปรเจกต์ก่อน push",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "ย้าย Git Remote และตรวจ URL.txt"
  },
  {
    id: 32,
    title: "รันงาน UAT Sync Data เข้า OMSAP <REDACTED_ID>",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nรีเฟรชข้อมูลที่ค้างใน UAT แล้วสั่ง job `JOB_Sync_DataStaging2OMSAP_UAT` ใหม่\n\njob นี้เรียกใช้ stored procedure ต่อไปนี้\n- `dbo.SP_Sync_Data2OMSAP_Afsales_CNDN_IncludeVat`\n- `dbo.SP_Sync_Data2OMSAP_HAS_Afsales_CNDN_IncludeVat`\n- `dbo.SP_Sync_Data2OMSAP_HAS_Order_SendSAP_Completed`\n- `dbo.SP_Sync_Data2OMSAP_Order_SendSAP_Completed`\n- `dbo.SP_Sync_Data2OMSAP_OTC_Payment`\n\nขั้นตอน\n1. Stop job `JOB_Sync_DataStaging2OMSAP_UAT`\n2. สร้างตารางชั่วคราว `#TempLE`\n\n```sql\nSELECT DISTINCT TOP 900\n       T1.OTCPurchaseOrderNumber,\n       LEDocumentNumber,\n       CustomerCode,\n       CustomerName\nINTO #TempLE\nFROM TB_FTD_LE_Order_TransportProducts AS T1\nJOIN TB_OTC_Sale_Order AS T2\n    ON T1.OTCPurchaseOrderNumber = T2.OTCPurchaseOrderNumber\n```\n\nหมายเหตุ\n- ถ้ามี `#TempLE` ค้างอยู่ ให้ `DROP TABLE #TempLE` ก่อน\n\n3. บันทึกเวลาเริ่ม\n\n```sql\nSELECT GETDATE() AS StartRun\n```\n\n4. ตรวจข้อมูลใน `#TempLE`\n\n```sql\nSELECT * FROM #TempLE\n```\n\n5. อัปเดต `DA_Sync_Date` ของทุกตารางที่เกี่ยวข้อง\n\n```sql\nUPDATE TB_FTD_LE_Order\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber IN (SELECT LEDocumentNumber FROM #TempLE);\n\nUPDATE TB_FTD_LE_Order_Items\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber IN (SELECT LEDocumentNumber FROM #TempLE);\n\nUPDATE TB_FTD_LE_Order_TransportOrders\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber IN (SELECT LEDocumentNumber FROM #TempLE);\n\nUPDATE TB_FTD_LE_Order_TransportProducts\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber IN (SELECT LEDocumentNumber FROM #TempLE);\n\nUPDATE TB_OTC_Sale_Order\nSET DA_Sync_Date = GETDATE()\nWHERE OtcPurchaseOrderNumber IN (SELECT OtcPurchaseOrderNumber FROM #TempLE);\n```\n\n6. เปิด job `JOB_Sync_DataStaging2OMSAP_UAT` กลับมา",
    dateCreated: new Date("2026-03-23"),
    status: "Archived" as Manuscript['status'],
    fileName: "รันงาน UAT Sync Data เข้า OMSAP <REDACTED_ID>.txt"
  },
  {
    id: 33,
    title: "ลบ SAP Error ของเอกสารรับคืนลดหนี้",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ลบ `SAP Error` ของเอกสารรับคืนลดหนี้จาก staging และรายงาน\n\n1. ตรวจและลบจาก `OTC_Sales_Staging`\n\n```sql\nSELECT TOP (1000) [Id]\n      ,[DocumentNumber]\n      ,[MessageDate]\n      ,[MessageType]\n      ,[Message]\n      ,[DA_Sync_Date]\nFROM [OTC_Sales_Staging].[dbo].[TB_OTC_Aftersales_Sap_Response_Message]\nWHERE DocumentNumber IN ('<REDACTED_ID>');\n```\n\n2. ถ้าตรวจถูกต้องแล้ว ให้สั่ง `DELETE` ในตารางเดียวกัน\n\n3. ตรวจและลบจาก `RPT_Sales_OR`\n\n```sql\nSELECT TOP (1000) [id]\n      ,[DocumentNumber]\n      ,[MessageDate]\n      ,[MessageType]\n      ,[Message]\n      ,[DocumentType]\n      ,[EventName]\n      ,[OrderDate]\n      ,[DA_Sync_Date]\n      ,[CompanyCode]\n      ,[BranchCode]\nFROM [RPT_Sales_OR].[dbo].[RPT_Sap_Response_Message]\nWHERE DocumentNumber IN ('<REDACTED_ID>');\n```\n\n4. ถ้าตรวจถูกต้องแล้ว ให้สั่ง `DELETE` ในตารางรายงาน",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ลบ SAP Error ของเอกสารรับคืนลดหนี้.txt"
  },
  {
    id: 34,
    title: "ลบ SAP Error Log จากรายงาน",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ลบ `SAP Error Log` ออกจากรายงาน\n\nตรวจข้อมูลก่อนลบ\n```sql\nSELECT *\nFROM [RPT_Sales_OR].[dbo].[RPT_Sap_Response_Message]\nWHERE DocumentNumber = '<REDACTED_ID>';\n```\n\nลบข้อมูล\n```sql\nDELETE\nFROM [RPT_Sales_OR].[dbo].[RPT_Sap_Response_Message]\nWHERE DocumentNumber = '<REDACTED_ID>';\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "ลบ SAP Error Log จากรายงาน.txt"
  },
  {
    id: 35,
    title: "วิธี Reproduce LE DocInfo",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ reproduce เคส `LE DocInfo` ผ่าน MongoDB และ Postman\n\nขั้นตอน\n1. เปิดไฟล์ `สคริปต์ Reproduce LE DocInfo.js`\n2. เปลี่ยนเลขเอกสารใน array ให้ตรงกับเคสที่ต้องการ\n3. ตรวจเงื่อนไขสถานะของเอกสารก่อนรัน\n4. รัน script\n5. ตรวจ collection `ProduceOMLogs`\n6. เปิด Postman\n7. ไปที่ token ของ Company แล้วคัดลอกมาใส่ `Bearer Auth`\n8. ตรวจ URL API ที่จะเรียก\n9. ตรวจ company จาก collection `ProduceOMLogs`\n10. รัน Postman\n11. กลับมาตรวจ `ProduceOMLogs` ว่าข้อมูลหายไปตาม flow ที่คาดไว้หรือไม่\n12. รอประมาณ 10 นาทีเพื่อดูผลการ reproduce",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "วิธี Reproduce LE DocInfo.txt"
  },
  {
    id: 36,
    title: "วิธี Reproduce OTC Sale",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ reproduce ใบขาย OTCSale ตามเลขเอกสารที่ต้องการ\n\nตัวอย่างเคส\n- ใบขาย `<REDACTED_ID>`\n\nขั้นตอน\n1. เปิด Swagger `http://internal.example.com/otcsellapi/swagger/index.html`\n2. ใส่ `Bearer token`\n3. เรียก API `PurchaseOrder/ReProduce/<REDACTED_ID>` โดยใช้ `signature: 9901`\n4. กด run\n5. ตรวจไฟล์ export เอกสารค้างขน\n6. filter ตาม `customer code` และ `product`\n7. ตรวจผลรวมของสินค้า",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "วิธี Reproduce OTC Sale.txt"
  },
  {
    id: 37,
    title: "สคริปต์อัปเดต DA Sync LE และ OTCSale",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้รีเฟรช `DA_Sync_Date` ของ LE และ OTCSale สำหรับเคสที่ข้อมูลไม่เดินต่อ\n\nSQL\n```sql\nUPDATE TB_FTD_LE_Order\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_Items\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportOrders\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_FTD_LE_Order_TransportProducts\nSET DA_Sync_Date = GETDATE()\nWHERE LEDocumentNumber = '<REDACTED_ID>';\n\nUPDATE TB_OTC_Sale_Order\nSET DA_Sync_Date = GETDATE()\nWHERE OtcPurchaseOrderNumber = '<REDACTED_ID>';\n\nUPDATE TB_OTC_Sale_OrderItem\nSET DA_Sync_Date = GETDATE()\nWHERE OTCPurchaseOrderNumber = '<REDACTED_ID>';\n\nUPDATE TB_OTC_Sale_Payment\nSET DA_Sync_Date = GETDATE()\nWHERE OTCPurchaseOrderNumber = '<REDACTED_ID>';\n```",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "สคริปต์อัปเดต DA Sync LE และ OTCSale.txt"
  },
  {
    id: 38,
    title: "สูตรคำนวณ LDMS",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้อธิบายวิธีคำนวณของแถมใน LDMS เมื่อมีการขนสินค้าไม่เต็มจำนวน\n\nสูตรหลัก\n`(จำนวนสินค้าที่ขนจริง x จำนวนของแถมที่เหลือ) / จำนวนสินค้าทั้งหมดที่เหลือ`\n\nหมายเหตุ\n- สูตรนี้ใช้กับสินค้าเดียวกันในชุดโปรโมชั่นเดียวกัน\n\nตัวอย่าง\n- เหล้า 100\n- ของแถมขนม 10\n- ของแถมน้ำ 5\n- ต้องการขนเหล้า 30\n\nวิธีคิด\n- ถ้าสินค้า 100 ได้ของแถม 10\n- ขนจริง 30 จะได้ของแถม `10 / 100 x 30 = 3`\n\n- ถ้าสินค้า 100 ได้ของแถม 5\n- ขนจริง 30 จะได้ของแถม `5 / 100 x 30 = 1.5`\n- ปัดขึ้นเป็นของแถม 2\n\nกรณีมีหลายใบขาย\n- ถ้ายอดขนรวมมากกว่าใบขายเดียว LDMS จะวนคำนวณข้ามหลายใบจนกว่าจะพอกับจำนวนที่ต้องการขน",
    dateCreated: new Date("2026-03-23"),
    status: "Published" as Manuscript['status'],
    fileName: "สูตรคำนวณ LDMS.txt"
  },
  {
    id: 39,
    title: "หา Shipment No จากเลขเอกสาร",
    category: "Imported / Text",
    content: "วัตถุประสงค์\nใช้ไล่หา `Shipment No` จาก `LEDocumentNumber`\n\nขั้นตอน\n1. ตรวจข้อมูลในรายงานฝั่ง LE\n\n```sql\nSELECT *\nFROM [RPT_Sales_OR].[dbo].[RPT_OTC_Transport_Detail_LE]\nWHERE LEDocumentNumber = '<REDACTED_ID>'\n```\n\n2. ตรวจว่าขาดข้อมูลอะไรจากรายงานหลัก\n\n```sql\nSELECT *\nFROM [RPT_Sales_OR].[dbo].[RPT_OTC_Transport_Detail]\nWHERE LEDocumentNumber = '<REDACTED_ID>'\n  AND EXECUTION_ID IS NULL\n```\n\n3. ใช้ `TRANSPORT_ORDER_NO` ไปหาในฐานข้อมูล logistics\n\n```sql\nSELECT *\nFROM [RPT_LogisticsDB].[dbo].[TB_RPDB_EXECUTION]\nWHERE TRANSPORT_ORDER_NO = '<REDACTED_ID>'\n```\n\nหมายเหตุ\n- ถ้าข้อมูลของทั้งสองฝั่งเท่ากันแล้ว ให้ประสานทีม FTD เพื่อ sync ข้อมูล",
    dateCreated: new Date("2026-04-03"),
    status: "Published" as Manuscript['status'],
    fileName: "หา Shipment No จากเลขเอกสาร.txt"
  },
];
