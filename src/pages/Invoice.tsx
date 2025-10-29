import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Trash2, PlusCircle } from "lucide-react";
import { useParams } from "react-router-dom";
interface InvoiceData {
    invoiceNo: string;
    date: string;
    deliveryNote: string;
    paymentTerms: string;
    referenceNo: string;
    otherReferences: string;
    buyersOrderNo: string;
    orderDated: string;
    dispatchDocNo: string;
    deliveryNoteDate: string;
    dispatchedThrough: string;
    destination: string;
    termsOfDelivery: string;
}

const Invoice = () => {
    const { id } = useParams(); // 👈 get invoice id from URL

    const baseURL = import.meta.env.VITE_API_URL;
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    console.log(selectedClient, "selectedClientselectedClient");

    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        invoiceNo: "",
        date: new Date().toISOString().split("T")[0],
        deliveryNote: "",
        paymentTerms: "",
        referenceNo: "",
        otherReferences: "",
        buyersOrderNo: "",
        orderDated: "",
        dispatchDocNo: "",
        deliveryNoteDate: "",
        dispatchedThrough: "",
        destination: "",
        termsOfDelivery: "",
    });


    // ✅ Multiple product lines
    const [selectedProducts, setSelectedProducts] = useState<
        { productId: string; quantity: number }[]
    >([{ productId: "", quantity: 1 }]);

    useEffect(() => {
        const fetchBaseData = async () => {
            const [clientRes, productRes] = await Promise.all([
                axios.get(`${baseURL}/api/clients`),
                axios.get(`${baseURL}/api/products`),
            ]);
            setClients(clientRes.data.clients || clientRes.data);
            setProducts(productRes.data.products || productRes.data);
        };
        fetchBaseData();
    }, []);

    // ✅ Fetch existing invoice details if ID is present
    useEffect(() => {
        const fetchInvoiceById = async () => {
            if (!id) {
                const invoiceNo = `MICE/RJ/${Math.floor(Math.random() * 9999)}/${new Date()
                    .getFullYear()
                    .toString()
                    .slice(-2)}`;
                setInvoiceData((prev) => ({ ...prev, invoiceNo }));
                return;
            }

            try {
                const res = await axios.get(`${baseURL}/api/invoices/get/${id}`);
                const data = res.data.invoice;
                if (!data) return;

                console.log("datadatadata", data);

                // ✅ Set all invoice fields
                setInvoiceData({
                    invoiceNo: data.invoiceNo || "",
                    date: data.date?.split("T")[0] || "",
                    deliveryNote: data.deliveryNote || "",
                    paymentTerms: data.paymentTerms || "",
                    referenceNo: data.referenceNo || "",
                    otherReferences: data.otherReferences || "",
                    buyersOrderNo: data.buyersOrderNo || "",
                    orderDated: data.orderDated?.split("T")[0] || "",
                    dispatchDocNo: data.dispatchDocNo || "",
                    deliveryNoteDate: data.deliveryNoteDate?.split("T")[0] || "",
                    dispatchedThrough: data.dispatchedThrough || "",
                    destination: data.destination || "",
                    termsOfDelivery: data.termsOfDelivery || "",
                });

                // ✅ Directly set full client object (since backend populates it)
                setSelectedClient(data.clientId || null);

                // ✅ Set selected products
                setSelectedProducts(
                    data.products?.map((p: any) => ({
                        productId: p.productId?._id || p.productId,
                        quantity: p.quantity,
                    })) || []
                );
            } catch (err) {
                console.error("❌ Error fetching invoice:", err);
            }
        };

        fetchInvoiceById();
    }, [id]);

    // ✅ Add product row
    const handleAddProduct = () => {
        setSelectedProducts([...selectedProducts, { productId: "", quantity: 1 }]);
    };

    // ✅ Remove product row
    const handleRemoveProduct = (index: number) => {
        const updated = [...selectedProducts];
        updated.splice(index, 1);
        setSelectedProducts(updated);
    };

    // ✅ Update product or quantity
    const handleProductChange = (index: number, field: string, value: string | number) => {
        const updated = [...selectedProducts];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedProducts(updated);
    };

    // ✅ Total Calculations
    // ✅ Total Calculations (with state-based GST logic)
    const calculateTotals = () => {
        let subTotal = 0;
        let cgst = 0;
        let sgst = 0;

        selectedProducts.forEach((item) => {
            const product = products.find((p) => p._id === item.productId);
            if (product) {
                const productTotal = product.price * item.quantity;
                const gstRate = product.gst || 0;
                const gstAmount = (productTotal * gstRate) / 100;
                subTotal += productTotal;

                // 🧾 Check client’s state for tax distribution
                if (selectedClient?.stateName?.toLowerCase() === "rajasthan") {
                    // Local sale within Rajasthan
                    cgst += gstAmount / 2;
                    sgst += gstAmount / 2;
                } else {
                    // Inter-state sale (IGST applied)
                    cgst += 0;
                    sgst += gstAmount; // treat full as IGST
                }
            }
        });

        const totalAmount = subTotal + cgst + sgst;
        return { subTotal, cgst, sgst, totalAmount };
    };


    const { subTotal, cgst, sgst, totalAmount } = calculateTotals();

    // ✅ Generate PDF
    // ✅ Save Invoice + Generate PDF
    const generatePDF = async () => {
        try {
            const { subTotal, cgst, sgst, totalAmount } = calculateTotals();
            const invoicePayload = {
                ...invoiceData,
                clientId: selectedClient?._id || selectedClient,
                products: selectedProducts,
                subTotal,
                cgst,
                sgst,
                totalAmount,
            };

            // Decide whether to create or update
            const res = id
                ? await axios.put(`${baseURL}/api/invoices/${id}`, invoicePayload)
                : await axios.post(`${baseURL}/api/invoices/create`, invoicePayload);

            if (res.data.success) {
                const input = document.getElementById("invoice-preview");
                if (!input) return;

                const canvas = await html2canvas(input, { scale: 2 });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");

                const width = pdf.internal.pageSize.getWidth();
                const height = (canvas.height * width) / canvas.width;
                pdf.addImage(imgData, "PNG", 0, 0, width, height);
                pdf.save(`${invoiceData.invoiceNo}.pdf`);

                alert(id ? "✅ Invoice updated and PDF generated!" : "✅ Invoice created and PDF generated!");
            } else {
                alert("❌ Failed to save invoice.");
            }
        } catch (error) {
            console.error("Error saving invoice or generating PDF:", error);
            alert("❌ Something went wrong while saving invoice.");
        }
    };


    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">🧾 Generate Invoice</h1>

            {/* Invoice Form */}
            <div className="grid md:grid-cols-2 gap-6 bg-white shadow p-6 rounded-xl">
                <div>
                    <label className="font-semibold">Select Client</label>
                    <select
                        className="w-full border p-2 rounded mt-1"
                        value={selectedClient?._id || ""}
                        onChange={(e) =>
                            setSelectedClient(clients.find((c) => c._id === e.target.value))
                        }
                    >

                        <option value="">-- Choose Client --</option>
                        {clients.map((c: any) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="font-semibold">Invoice Date</label>
                    <Input
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) =>
                            setInvoiceData({ ...invoiceData, date: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Product Selection List */}
            <div className="bg-white shadow p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Products</h2>
                    <Button
                        onClick={handleAddProduct}
                        className="bg-gradient-to-r from-emerald-600 to-purple-600"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>

                {selectedProducts.map((item, index) => (
                    <div key={index} className="grid md:grid-cols-3 gap-4 mb-4 items-center">
                        <select
                            className="border p-2 rounded"
                            value={item.productId}
                            onChange={(e) =>
                                handleProductChange(index, "productId", e.target.value)
                            }
                        >
                            <option value="">-- Choose Product --</option>
                            {products.map((p: any) => (
                                <option key={p._id} value={p._id}>
                                    {p.name} - ₹{p.price} ({p.gst}% GST)
                                </option>
                            ))}
                        </select>

                        <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                                handleProductChange(index, "quantity", Number(e.target.value))
                            }
                            placeholder="Quantity"
                        />

                        <Button
                            variant="destructive"
                            onClick={() => handleRemoveProduct(index)}
                            className="flex items-center gap-1"
                        >
                            <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                    </div>
                ))}
            </div>
            <div className="bg-white shadow p-6 rounded-xl mt-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Note
                        </label>
                        <Input
                            placeholder="Enter delivery note"
                            value={invoiceData.deliveryNote}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, deliveryNote: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mode/Terms of Payment
                        </label>
                        <Input
                            placeholder="Enter mode or payment terms"
                            value={invoiceData.paymentTerms}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, paymentTerms: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference No. & Date
                        </label>
                        <Input
                            placeholder="Enter reference number and date"
                            value={invoiceData.referenceNo}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, referenceNo: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Other References
                        </label>
                        <Input
                            placeholder="Enter other references"
                            value={invoiceData.otherReferences}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, otherReferences: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buyer’s Order No.
                        </label>
                        <Input
                            placeholder="Enter buyer’s order number"
                            value={invoiceData.buyersOrderNo}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, buyersOrderNo: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dated
                        </label>
                        <Input
                            type="date"
                            value={invoiceData.orderDated}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, orderDated: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dispatch Doc No.
                        </label>
                        <Input
                            placeholder="Enter dispatch document number"
                            value={invoiceData.dispatchDocNo}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, dispatchDocNo: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Note Date
                        </label>
                        <Input
                            type="date"
                            value={invoiceData.deliveryNoteDate}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, deliveryNoteDate: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dispatched Through
                        </label>
                        <Input
                            placeholder="Enter dispatch method or carrier"
                            value={invoiceData.dispatchedThrough}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, dispatchedThrough: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Destination
                        </label>
                        <Input
                            placeholder="Enter destination"
                            value={invoiceData.destination}
                            onChange={(e) =>
                                setInvoiceData({ ...invoiceData, destination: e.target.value })
                            }
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terms of Delivery
                    </label>
                    <textarea
                        placeholder="Enter terms of delivery"
                        className="w-full border p-2 rounded focus:ring-emerald-500 focus:border-emerald-500"
                        rows={3}
                        value={invoiceData.termsOfDelivery}
                        onChange={(e) =>
                            setInvoiceData({ ...invoiceData, termsOfDelivery: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Invoice Preview */}
            <div
                id="invoice-preview"
                className="bg-white shadow-xl p-8 rounded-xl border text-sm leading-relaxed"
            >
                {/* Header */}
                <h2 className="text-center text-lg font-semibold mb-3 uppercase">
                    Tax Invoice
                </h2>

                {/* Invoice & Company Info */}
                <div className="grid grid-cols-2 gap-4 border-b pb-2">
                    <div>
                        <p className="font-bold text-gray-800">Mice Globals Rajasthan</p>
                        <p>413 Sun & Moon Chambers, Gopal Bari, Jaipur</p>
                        <p>GSTIN/UIN: 08ABEFM9256H2ZV</p>
                        <p>State Name: Rajasthan, Code: 08</p>
                        <p>E-Mail: info@miceglobals.in</p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                        <p><strong>Invoice No:</strong> {invoiceData.invoiceNo || "-"}</p>
                        <p><strong>Dated:</strong> {invoiceData.date || "-"}</p>
                        <p><strong>Delivery Note:</strong> {invoiceData.deliveryNote || "-"}</p>
                        <p><strong>Mode/Terms of Payment:</strong> {invoiceData.paymentTerms || "-"}</p>
                        <p><strong>Reference No. & Date:</strong> {invoiceData.referenceNo || "-"}</p>
                        <p><strong>Other References:</strong> {invoiceData.otherReferences || "-"}</p>
                    </div>
                </div>

                {/* Client Info */}
                {selectedClient && (
                    <div className="grid grid-cols-2 mt-3 border-b pb-3">
                        <div>
                            <p className="font-semibold mb-1">Consignee (Ship to)</p>
                            <p>{selectedClient.name}</p>
                            <p>{selectedClient.address}</p>
                            <p>GSTIN/UIN: {selectedClient.gstin}</p>
                            <p>State Name: {selectedClient.stateName}</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Buyer (Bill to)</p>
                            <p>{selectedClient.name}</p>
                            <p>{selectedClient.address}</p>
                            <p>GSTIN/UIN: {selectedClient.gstin}</p>
                            <p>State Name: {selectedClient.stateName}</p>
                        </div>
                    </div>
                )}

                {/* Transport & Dispatch Info */}
                <div className="grid grid-cols-2 mt-3 border-b pb-3">
                    <div>
                        <p><strong>Buyer’s Order No:</strong> {invoiceData.buyersOrderNo || "-"}</p>
                        <p><strong>Dated:</strong> {invoiceData.orderDated || "-"}</p>
                        <p><strong>Dispatch Doc No:</strong> {invoiceData.dispatchDocNo || "-"}</p>
                        <p><strong>Delivery Note Date:</strong> {invoiceData.deliveryNoteDate || "-"}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Dispatched Through:</strong> {invoiceData.dispatchedThrough || "-"}</p>
                        <p><strong>Destination:</strong> {invoiceData.destination || "-"}</p>
                        <p><strong>Terms of Delivery:</strong> {invoiceData.termsOfDelivery || "-"}</p>
                    </div>
                </div>

                {/* Product Table */}
                {selectedProducts.length > 0 && (
                    <table className="w-full mt-4 border border-gray-400 text-sm">
                        <thead className="bg-gray-100 font-semibold">
                            <tr>
                                <th className="border border-gray-400 p-2">Sl No</th>
                                <th className="border border-gray-400 p-2">Particulars</th>
                                <th className="border border-gray-400 p-2">Qty</th>
                                <th className="border border-gray-400 p-2">GST %</th>
                                <th className="border border-gray-400 p-2">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedProducts.map((item, i) => {
                                const p = products.find((x) => x._id === item.productId);
                                if (!p) return null;
                                const total = p.price * item.quantity;
                                return (
                                    <tr key={i}>
                                        <td className="border p-2 text-center">{i + 1}</td>
                                        <td className="border p-2">{p.name} ({p.model})</td>
                                        <td className="border p-2 text-center">{item.quantity}</td>
                                        <td className="border p-2 text-center">{p.gst}%</td>
                                        <td className="border p-2 text-right">{total.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            {selectedClient?.stateName?.toLowerCase() === "rajasthan" ? (
                                <>
                                    <tr>
                                        <td colSpan={4} className="border p-2 text-right font-semibold">
                                            CGST (9%)
                                        </td>
                                        <td className="border p-2 text-right">{cgst.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} className="border p-2 text-right font-semibold">
                                            SGST (9%)
                                        </td>
                                        <td className="border p-2 text-right">{sgst.toFixed(2)}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={4} className="border p-2 text-right font-semibold">
                                        IGST (18%)
                                    </td>
                                    <td className="border p-2 text-right">{sgst.toFixed(2)}</td>
                                </tr>
                            )}

                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan={4} className="border p-2 text-right">Total</td>
                                <td className="border p-2 text-right">{totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                )}

                {/* Footer */}
                <div className="mt-6 flex justify-between items-start text-sm">
                    <div>
                        <p className="font-semibold mb-1">Company’s Bank Details</p>
                        <p><strong>Bank Name:</strong> ICICI Bank</p>
                        <p><strong>A/c No:</strong> 1234567890</p>
                        <p><strong>IFSC:</strong> ICIC0001234</p>
                    </div>
                    <div className="text-right">
                        <p>for <strong>Mice Globals Rajasthan</strong></p>
                        <p className="mt-10">Authorised Signatory</p>
                    </div>
                </div>
            </div>



            {/* Generate Button */}
            <div className="flex justify-end">
                <Button
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:opacity-90"
                >
                    Generate PDF
                </Button>
            </div>
        </div>
    );
};

export default Invoice;
