import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import InvoiceModal from '@/components/InvoiceModal.vue'
import db from "@/firebase/firebaseinit"
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    invoiceModal: null,
    modalActive: null,
    invoiceData: [],
    invoicesLoaded: null,
    currentInvoiceArray: null,
    editInvoice: null,
  }),
  actions: {
    TOGGLE_INVOICE() {
      this.invoiceModal = !this.invoiceModal
    },
    TOGGLE_MODAL() {
      this.modalActive = !this.modalActive
    },
    SET_INVOICE_DATA(payload){
      this.invoiceData.push(payload)
      
      
    },
    SET_CURRENT_INVOICE(payload){
      this.currentInvoiceArray = this.invoiceData.filter((invoice) => {
        return invoice.invoiceId === payload
    })
    },
    TOGGLE_EDIT_INVOICE(){
      this.editInvoice = !this.editInvoice
    },
    DELETE_INVOICE(payload){
      this.invoiceData = this.invoiceData.filter(invoice => invoice.docId !== payload)
    },
    UPDATE_STATUS_TO_PAID(payload){
      this.invoiceData.forEach(invoice =>{
        if(invoice.docId === payload){
          invoice.invoicePaid = true;
          invoice.invoicePending = false;
          
        }
      })
    },
    UPDATE_STATUS_TO_PENDING(payload){
      this.invoiceData.forEach(invoice =>{
        if(invoice.docId === payload){
          invoice.invoicePaid = false;
          invoice.invoicePending = true;
          invoice.invoiceDraft = false;
          
        }
      })
    },
    async UPDATE_STATUS_TO_PAID_A(docId) {
      try {
        const invoiceRef = doc(db, 'invoices', docId);
        await updateDoc(invoiceRef, {
          invoicePaid: true,
          invoicePending: false
        });
        this.UPDATE_STATUS_TO_PAID(docId);
      } catch (error) {
        console.error("Error updating invoice status to paid:", error);
        // Handle errors as needed
      }
    },
    async UPDATE_STATUS_TO_PENDING_A(docId) {
      try {
        const invoiceRef = doc(db, 'invoices', docId);
        await updateDoc(invoiceRef, {
          invoicePaid: false,
          invoicePending: true,
          invoiceDraft: false
        });
        this.UPDATE_STATUS_TO_PENDING(docId);
      } catch (error) {
        console.error("Error updating invoice status to pending:", error);
        // Handle errors as needed
      }
    },
    async DELETE_INV(docId){
      await deleteDoc(doc(db, 'invoices', docId));
      this.DELETE_INVOICE(docId);
    },
    async UPDATE_INVOICE(docId, routeId){
      this.DELETE_INVOICE(docId);
      await this.GET_INVOICES();
      this.TOGGLE_INVOICE()
      this.TOGGLE_EDIT_INVOICE()
      this.SET_CURRENT_INVOICE(routeId)
    },
    async GET_INVOICES(){
      const getData = await getDocs(collection(db,'invoices'));
      getData.forEach(doc => {
        if(!this.invoiceData.some(invoice => invoice.docId === doc.id)){
          const data = {
            docId: doc.id,
            invoiceId: doc.data().invoiceId,
            billerStreetAddress: doc.data().billerStreetAddress,
            billerCity: doc.data().billerCity,
            billerZipCode: doc.data().billerZipCode,
            billerCountry: doc.data().billerCountry,
            clientName: doc.data().clientName,
            clientEmail: doc.data().clientEmail,
            clientStreetAddress: doc.data().clientStreetAddress,
            clientCity: doc.data().clientCity,
            clientZipCode: doc.data().clientZipCode,
            clientCountry: doc.data().clientCountry,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            invoiceDate: doc.data().invoiceDate,
            paymentTerms: doc.data().paymentTerms,
            paymentDueDateUnix: doc.data().paymentDueDateUnix,
            paymentDueDate: doc.data().paymentDueDate,
            productDescription: doc.data().productDescription,
            invoiceItemList: doc.data().invoiceItemList,
            invoiceTotal: doc.data().invoiceTotal,
            invoicePending: doc.data().invoicePending,
            invoiceDraft: doc.data().invoiceDraft,
            invoicePaid: doc.data().invoicePaid,
          };
          this.SET_INVOICE_DATA(data);
          
        }
      });
      this.invoicesLoaded = true
    }
  }
})
