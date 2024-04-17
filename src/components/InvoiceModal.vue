<template>
    <div class="invoice-wrap flex flex-column" @click="checkClick" ref="invoiceWrap">
        <form @submit.prevent="submitForm" class="invoice-content">
            <Loading v-show="loading"></Loading>
            <h1 v-if="!editInvoice">New Invoice</h1>
            <h1 v-else>Edit Invoice</h1>
            <!--Bill From-->

            <div class="bill-from flex flex-column">
                <h4>Bill From</h4>
                <div class="input flex flex-column">
                    <label for="billerStreetAddress">Street Address</label>
                    <input type="text" required id="billerStreetAddress" v-model="billerStreetAddress">
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="billerCity">City</label>
                        <input type="text" required id="billerCity" v-model="billerCity">
                    </div>
                    <div class="input flex flex-column">
                        <label for="billerZipCode">Zip Code</label>
                        <input type="text" required id="billerZipCode" v-model="billerZipCode">
                    </div>
                    <div class="input flex flex-column">
                        <label for="billerCountry">Country</label>
                        <input type="text" required id="billerCountry" v-model="billerCountry">
                    </div>
                </div>
            </div>

            <!--Bill TO-->
            <div class="bill-to flex flex-column">
                <h4>Bill To</h4>
                <div class="input flex flex-column">
                    <label for="clientName">Client's Name</label>
                    <input type="text" required id="clientName" v-model="clientName">
                </div>
                <div class="input flex flex-column">
                    <label for="clientEmail">Client's Email</label>
                    <input type="text" required id="clientEmail" v-model="clientEmail">
                </div>
                <div class="input flex flex-column">
                    <label for="clientStreetAddress">Street Address</label>
                    <input type="text" required id="clientStreetAddress" v-model="clientStreetAddress">
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="clientCity">City</label>
                        <input type="text" required id="clientCity" v-model="clientCity">
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientZipCode">Zip Code</label>
                        <input type="text" required id="clientZipCode" v-model="clientZipCode">
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientCountry">Country</label>
                        <input type="text" required id="clientCountry" v-model="clientCountry">
                    </div>
                </div>
            </div>

            <!--Invoie WOrk Details-->
            <div class="invoice-work flex flex-column">
                <div class="payment flex">
                    <div class="input flex flex-column">
                        <label for="invoiceDate">Invoice Date</label>
                        <input type="text" disabled id="invoiceDate" v-model="invoiceDate">
                    </div>
                    <div class="input flex flex-column">
                        <label for="paymentDueDate">Payment Due</label>
                        <input type="text" disabled id="paymentDueDate" v-model="paymentDueDate">
                    </div>
                </div>
                <div class="input flex flex-column">
                    <label for="paymentTerms">Payment Terms</label>
                    <select required id="paymentTerms" v-model="paymentTerms">
                        <option value="30">Net 30 Days</option>
                        <option value="60">Net 60 Days</option>
                    </select>
                </div>
                <div class="input flex flex-column">
                    <label for="productDescription">Product Description</label>
                    <input type="text" required id="productDescription" v-model="productDescription">
                </div>
                <div class="work-items">
                    <h3>Item List</h3>
                    <table class="item-list">
                        <tr class="table-heading flex">
                            <th class="item-name">Item Name</th>
                            <th class="qty">Qty</th>
                            <th class="price">Price</th>
                            <th class="total">Total</th>
                        </tr>
                        <tr class="table-items flex" v-for="(item, index) in invoiceItemList" :key="index">
                            <td class="item-name"><input type="text" v-model="item.itemName"></td>
                            <td class="qty"><input type="text" v-model="item.qty"></td>
                            <td class="price"><input type="text" v-model="item.price"></td>
                            <td class="total flex">${{ item.total = item.qty * item.price }}</td>
                            <img src="@/assets/icon-delete.svg" @click="deleteInvoiceItem(item.id)">
                        </tr>
                    </table>
                    <div @click="addNewInvoiceItem" class="flex button">
                        <img src="@/assets/icon-plus.svg">
                        Add New Item
                    </div>
                </div>
            </div>

            <!--Save/Exit-->

            <div class="save flex">
                <div class="left">
                    <button type="button" class="red" @click="closeInvoice">Cancel</button>
                </div>
                <div class="right flex">
                    <button v-if="!editInvoice" type="submit" class="dark-purple" @click="saveDraft">Save Draft</button>
                    <button v-if="!editInvoice"  type="submit" class="purple" @click="publishInvoice">Create Invoice</button>
                    <button v-if="editInvoice" type="submit" class="purple">Update Invoice</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import db from '../firebase/firebaseinit'
import Loading from './Loading.vue';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { onMounted, ref, watch, computed } from 'vue'
import { uid } from 'uid';
import { useCounterStore } from '@/stores/counter'
import {useRoute} from 'vue-router'

const route = useRoute()

const store = useCounterStore()
const invoiceWrap = ref(null);
const dateOptions = ref({ year: 'numeric', month: 'short', day: 'numeric' })
const docId = ref(null)
const loading = ref(null)
const billerStreetAddress = ref(null)
const billerCity = ref(null)
const billerZipCode = ref(null)
const billerCountry = ref(null)
const clientName = ref(null)
const clientEmail = ref(null)
const clientStreetAddress = ref(null)
const clientCity = ref(null)
const clientZipCode = ref(null)
const clientCountry = ref(null)
const invoiceDateUnix = ref(null)
const invoiceDate = ref(null)
const paymentTerms = ref(null)
const paymentDueDateUnix = ref(null)
const paymentDueDate = ref(null)
const productDescription = ref(null)
const invoicePending = ref(null)
const invoiceDraft = ref(null)
const invoiceItemList = ref([])
const invoiceTotal = ref(0)

function checkClick(e){
    if(e.target === invoiceWrap.value){
        store.TOGGLE_MODAL()
    }
}


const editInvoice = computed(() => store.editInvoice);
const currentInvoiceArray = computed(() => store.currentInvoiceArray);

function closeInvoice() {
    store.TOGGLE_INVOICE()
    if(editInvoice.value){
        store.TOGGLE_EDIT_INVOICE()
    }
}

function addNewInvoiceItem() {
    invoiceItemList.value.push({
        id: uid(),
        itemName: '',
        qty: '',
        price: 0,
        total: 0
    })
}

function deleteInvoiceItem(id) {
    invoiceItemList.value = invoiceItemList.value.filter((item) => item.id !== id)
}

function calInvoiceTotal() {
    invoiceTotal.value = 0;
    invoiceItemList.value.forEach(item => {
        invoiceTotal.value += item.total
    })
}

function publishInvoice() {
    invoicePending.value = true
    
}

function saveDraft() {
    invoiceDraft.value = true
}
async function uploadInvoice(){
    try {
        // Check if invoiceItemList is empty
        if (invoiceItemList.value.length === 0) {
            alert('Please ensure you fill out work items!');
            return;
        }

        loading.value = true;

        // Calculate invoice total
        calInvoiceTotal();

        // Prepare invoice data
        const invoiceData = await addDoc(collection(db,'invoices'),{
            invoiceId: uid(6),
            billerStreetAddress: billerStreetAddress.value,
            billerCity: billerCity.value,
            billerZipCode: billerZipCode.value,
            billerCountry: billerCountry.value,
            clientName: clientName.value,
            clientEmail: clientEmail.value,
            clientStreetAddress: clientStreetAddress.value,
            clientCity: clientCity.value,
            clientZipCode: clientZipCode.value,
            clientCountry: clientCountry.value,
            invoiceDateUnix: invoiceDateUnix.value,
            invoiceDate: invoiceDate.value,
            paymentTerms: paymentTerms.value,
            paymentDueDateUnix: paymentDueDateUnix.value,
            paymentDueDate: paymentDueDate.value,
            productDescription: productDescription.value,
            invoicePending: invoicePending.value,
            invoiceDraft: invoiceDraft.value,
            invoiceItemList: invoiceItemList.value,
            invoiceTotal: invoiceTotal.value,
            invoicePaid: null,
        });

        loading.value = false


        store.TOGGLE_INVOICE();
        store.GET_INVOICES();
    } catch (error) {
        console.error("Error uploading invoice:", error);
        alert("An error occurred while uploading the invoice. Please try again later.");
    }
}

async function updateInvoice(){
    try {
        // Check if invoiceItemList is empty
        if (invoiceItemList.value.length === 0) {
            alert('Please ensure you fill out work items!');
            return;
        }

        loading.value = true;

        // Calculate invoice total
        calInvoiceTotal();

        // Prepare invoice data
        const invoiceData = doc(db, 'invoices', docId.value);

        await updateDoc(invoiceData, {
            billerStreetAddress: billerStreetAddress.value,
            billerCity: billerCity.value,
            billerZipCode: billerZipCode.value,
            billerCountry: billerCountry.value,
            clientName: clientName.value,
            clientEmail: clientEmail.value,
            clientStreetAddress: clientStreetAddress.value,
            clientCity: clientCity.value,
            clientZipCode: clientZipCode.value,
            clientCountry: clientCountry.value,
            paymentTerms: paymentTerms.value,
            paymentDueDateUnix: paymentDueDateUnix.value,
            paymentDueDate: paymentDueDate.value,
            productDescription: productDescription.value,
            invoiceItemList: invoiceItemList.value,
            invoiceTotal: invoiceTotal.value,
        })
           
        loading.value = false;

        const data = {
            docId: docId.value,
            routeId:route.params.invoiceId
        }



        store.UPDATE_INVOICE(data);
    } catch (error) {
        console.error("Error uploading invoice:", error);
        alert("An error occurred while uploading the invoice. Please try again later.");
    }
}

function submitForm() {
    if(editInvoice.value){
        updateInvoice();
        return
    }
    uploadInvoice()
    
}

onMounted(() => {
    if(!editInvoice.value){
        invoiceDateUnix.value = Date.now();
        invoiceDate.value = new Date(invoiceDateUnix.value).toLocaleDateString('en-us', dateOptions.value)
    }

    if(editInvoice.value){
        const currentInvoice = currentInvoiceArray.value[0];
        docId.value = currentInvoice.docId
        billerStreetAddress.value = currentInvoice.billerStreetAddress
        billerCity.value = currentInvoice.billerCity
        billerZipCode.value = currentInvoice.billerZipCode
        billerCountry.value = currentInvoice.billerCountry
        clientName.value = currentInvoice.clientName
        clientEmail.value = currentInvoice.clientEmail  
        clientStreetAddress.value = currentInvoice.clientStreetAddress
        clientCity.value = currentInvoice.clientCity
        clientZipCode.value = currentInvoice.clientZipCode
        clientCountry.value = currentInvoice.clientCountry
        invoiceDateUnix.value = currentInvoice.invoiceDateUnix
        invoiceDate.value = currentInvoice.invoiceDate
        paymentTerms.value = currentInvoice.paymentTerms
        paymentDueDateUnix.value = currentInvoice.paymentDueDateUnix
        paymentDueDate.value = currentInvoice.paymentDueDate
        productDescription.value = currentInvoice.productDescription
        invoicePending.value = currentInvoice.invoicePending
        invoiceDraft.value = currentInvoice.invoiceDraft
        invoiceItemList.value = currentInvoice.invoiceItemList
        invoiceTotal.value = currentInvoice.invoiceTotal
    }
    
});



watch(paymentTerms, () => {
    const futureDate = new Date();
    paymentDueDateUnix.value = futureDate.setDate(futureDate.getDate() + parseInt(paymentTerms.value));
    paymentDueDate.value = new Date(paymentDueDateUnix.value).toLocaleDateString('en-us', dateOptions.value)
});
</script>



<style scoped>
.invoice-wrap {
    position: fixed;
    top: 0;
    left: 0;
    background-color: transparent;
    width: 100%;
    height: 100vh;
    overflow: scroll;
    overflow-x: hidden;

    @media(min-width:900px) {
        left: 90px;
    }

    .invoice-content {
        position: relative;
        padding: 56px;
        max-width: 700px;
        width: 100%;
        background-color: #141625;
        color: #fff;
        box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

        h1 {
            margin-bottom: 48px;
            color: #fff;
        }

        h3 {
            margin-bottom: 16px;
            font-size: 18px;
            color: #777f98;
        }

        h4 {
            color: #7c5dfa;
            font-size: 12px;
            margin-bottom: 24px;
        }

        .bill-to,
        .bill-from {
            margin-bottom: 48px;

            .location-details {
                gap: 16px;

                div {
                    flex: 1;
                }
            }
        }

        .invoice-work {
            .payment {
                gap: 24px;

                div {
                    flex: 1;
                }
            }

            .work-items {
                .item-list {
                    width: 100%;

                    .table-heading,
                    .table-items {
                        gap: 16px;
                        font-size: 12px;

                        .item-name {
                            flex-basis: 50%;
                        }

                        .qty {
                            flex-basis: 10%;
                        }

                        .price {
                            flex-basis: 20%;
                        }

                        .total {
                            flex-basis: 20%;
                            align-self: center;
                        }
                    }

                    .table-heading {
                        margin-bottom: 16px;

                        th {
                            text-align: left;
                        }
                    }

                    .table-items {
                        position: relative;
                        margin-bottom: 24px;

                        img {
                            position: absolute;
                            top: 15px;
                            right: 0;
                            width: 12px;
                            height: 16px;
                        }
                    }
                }

                .button {
                    color: #FFF;
                    background-color: #252945;
                    align-items: center;
                    justify-content: center;
                    width: 100%;

                    img {
                        margin-right: 4px;
                    }
                }
            }


        }

        .save {
            margin-top: 60px;

            div {
                flex: 1;

            }

            .right {
                justify-content: flex-end;
            }
        }


    }


    .input {
        margin-bottom: 24px;
    }

    label {
        font-size: 12px;
        margin-bottom: 6px;
    }

    input,
    select {
        width: 100%;
        background-color: #1e2139;
        color: #fff;
        border-radius: 4px;
        padding: 12px 4px;
        border: none;

        &:focus {
            outline: none;
        }
    }
}
</style>