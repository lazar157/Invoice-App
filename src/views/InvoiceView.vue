<template>
    <!-- <div v-if="currentInvoiceArray && currentInvoiceArray.length > 0">
        {{ currentInvoiceArray[0].invoiceId }}
    </div> -->

    <div class="invoice-view container" v-if="currentInvoice">
        <router-link :to="{name: 'home'}" class="nav-link flex">
            <img src="@/assets/icon-arrow-left.svg"> Go Back
        </router-link>
        <div class="header flex">
            <div class="left flex">
                <span>Status</span>
                <div class="status-button flex" :class="{
                    paid: currentInvoice.invoicePaid,
                    draft: currentInvoice.invoiceDraft,
                    pending: currentInvoice.invoicePending,
                }">
                <span v-if="currentInvoice.invoicePaid">Paid</span>
                <span v-if="currentInvoice.invoiceDraft">Draft</span>
                <span v-if="currentInvoice.invoicePending">Pending</span>
                </div>
            </div>
            <div class="right flex">
                <button class="dark-purple" @click="toggleEditInvoice">Edit</button>
                <button class="red" @click="deleteInvoice(currentInvoice.docId)">Delete</button>
                <button class="green" v-if="currentInvoice.invoicePending" @click="updateStatusToPaid(currentInvoice.docId)">Mark as Paid</button>
                <button v-if="currentInvoice.invoiceDraft || currentInvoice.invoicePaid" @click="updateStatusToPending(currentInvoice.docId)" class="orange">Mark as Pending</button>
            </div>
        </div>
        <!--Invoice Details-->

        <div class="invoice-details flex flex-column">
            <div class="top flex">
                <div class="left flex flex-column">
                    <p><span>#</span>{{ currentInvoice.invoiceId }}</p>
                    <p>{{ currentInvoice.productDescription }}</p>
                </div>
                <div class="right flex flex-column">
                    <p>{{ currentInvoice.billerStreetAddress }}</p>
                    <p>{{ currentInvoice.billerCity }}</p>
                    <p>{{ currentInvoice.billerZipCode }}</p>
                    <p>{{ currentInvoice.billerCountry }}</p>
                </div>
            </div>
            <div class="middle flex">
                <div class="payment flex flex-column">
                    <h4>Invoice Date</h4>
                    <p>{{ currentInvoice.invoiceDate }}</p>
                    <h4>Payment Date</h4>
                    <p>{{ currentInvoice.paymentDueDate }}</p>
                </div>
                <div class="bill flex flex-column">
                    <h4>Bill to</h4>
                    <p>{{ currentInvoice.clientName }}</p>
                    <p>{{ currentInvoice.clientStreetAddress }}</p>
                    <p>{{ currentInvoice.clientCity }}</p>
                    <p>{{ currentInvoice.clientZipCode }}</p>
                    <p>{{ currentInvoice.clientCountry }}</p>
                </div>
                <div class="send-to flex flex-column">
                    <h4>Sent To</h4>
                    <p>{{ currentInvoice.clientEmail }}</p>
                </div>
            </div>
            <div class="bottom flex flex-column">
                <div class="billing-items">
                    <div class="heading flex">
                        <p>Item Name</p>
                        <p>QTY</p>
                        <p>Price</p>
                        <p>Total</p>
                    </div>
                    <div class="item flex" v-for="(item, index) in currentInvoice.invoiceItemList" :key="index">
                        <p>{{ item.itemName }}</p>
                        <p>{{ item.qty }}</p>
                        <p>{{ item.price }}</p>
                        <p>{{ item.total }}</p>
                    </div>
                </div>
                <div class="total flex">
                    <p>Amount Due</p>
                    <p>{{ currentInvoice.invoiceTotal }}</p>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { useCounterStore } from '@/stores/counter'
import {ref, computed, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
const router = useRouter()
const store = useCounterStore()
const route = useRoute()
const currentInvoice = ref(null)

const currentInvoiceArray = computed(() => store.currentInvoiceArray);

onMounted(()=>{
    getCurrentInvoice()
})

function getCurrentInvoice(){
    const invoiceId = route.params.invoiceId
    store.SET_CURRENT_INVOICE(route.params.invoiceId)

    currentInvoice.value = currentInvoiceArray.value[0]
}

function toggleEditInvoice(){
    store.TOGGLE_EDIT_INVOICE();
    store.TOGGLE_INVOICE();
}

async function deleteInvoice(docId){
    await store.DELETE_INV(docId)
    router.push({name: 'home'})
}

function updateStatusToPaid(docId){
    store.UPDATE_STATUS_TO_PAID_A(docId)
}

function updateStatusToPending(docId){
    store.UPDATE_STATUS_TO_PENDING_A(docId)
}

const editInvoice = computed(() => store.editInvoice);

watch([() => editInvoice.value], ([newValue]) => {
    if (!newValue) {
        currentInvoice.value = currentInvoiceArray.value[0];
        window.location.reload();
    }
});
</script>


<style scoped>
.invoice-view{
    .nav-link{
        margin-bottom: 32px;
        align-items: center;
        color: #FFF;
        font-size: 12px;
        img{
            margin-right: 16px;
            width: 7px;
            height: 10px;
        }
    }

    .header,
    .invoice-details{
        background-color: #1e2139;
        border-radius: 20px;
    }

    .header{
        align-items: center;
        padding: 24px 32px;
        font-size: 12px;

        .left{
            align-items: center;

            span{
                color: #dfe3fa;
                margin-right: 16px;
            }
        }

        .right{
            flex: 1;
            justify-content: flex-end;

            button{
                color: #FFF;
            }
        }
    }

    .invoice-details{
        padding: 48px;
        margin-top: 24px;

        .top{
            div{
                color: #dfe3fa;
                flex: 1;
            }

            .left{
                font-size: 12px;
                p:first-child{
                    font-size: 24px;
                    text-transform: uppercase;
                    color: #fff;
                    margin-bottom: 8px;
                }

                p:nth-child(2){
                    font-size: 16px;
                }

                span{
                    color: #888eb0;
                }
            }

            .right{
                font-size: 12px;
                align-items: flex-end;
            }
        }
        .middle{
            margin-top: 50px;
            color: #dfe3fa;
            gap: 16px;

            h4{
                font-size: 12px;
                font-weight: 400;
                margin-bottom: 12px;
            }

            p{
                font-size: 16px;
            }
            .bill,
            .payment{
                flex: 1;
            }

            .payment{
                h4:nth-child(3){
                    margin-top: 32px;
                }
                
                p{
                    font-weight: 600;
                }
            }

            .bill{
                p:nth-child(2){
                    font-size: 16px;
                }
                p:nth-child(3){
                    margin-top: auto;
                }

                p{
                    font-size: 12px;
                }
            }

            .send-to{
                flex: 2;
            }
        }

        .bottom{
            margin-top: 50px;
            .billing-items{
                padding: 32px;
                border-radius: 20px 20px 0 0;
                background-color: #252945;

                .heading{
                    color: #dfe3fa;
                    font-size: 12px;
                    margin-bottom: 32px;

                    p:first-child{
                        flex: 3;
                        text-align: left;
                    }

                    p{
                        flex: 1;
                        text-align: right;
                    }
                }

                .item{
                    margin-bottom: 32px;
                    font-size: 13px;
                    color: #FFF;

                    &:last-child{
                        margin-bottom: 0;
                    }

                    p:first-child{
                        flex: 3;
                        text-align: left;
                    }

                    p{
                        flex: 1;
                        text-align: right;
                    }
                }
            }

            .total{
                color: #fff;
                padding: 32px;
                background-color: rgba(12, 14, 22, 0.7);
                align-items: center;
                border-radius: 0 0 20px 20px;

                p{
                    flex: 1;
                    font-size: 12px;
                }

                p:nth-child(2){
                    font-size: 28px;
                    text-align: right;
                }
            }
        }
    }
}
</style>