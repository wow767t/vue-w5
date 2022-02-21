// import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js";
import 'https://unpkg.com/mitt/dist/mitt.umd.js'; // mitt
const emitter = mitt();


const apiUrl = 'https://vue3-course-api.hexschool.io/v2/'
const apiPath = 'scott'

Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});

VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為輸入字元立即進行驗證 
});

const app = Vue.createApp({
    data() {
        return {
            cart: {},
            products: [],
            targetId: '',
            isLoading: '',
            formInfo: {
                "user": {
                    "name": "",
                    "email": "",
                    "tel": "",
                    "address": ""
                },
                "message": ""
            },
            orderPrice:{
                total: null,
                final_total: null
            }
        }
    },
    methods: {
        // get products data
        getProducts() {
            const url = `${apiUrl}api/${apiPath}/products/all`
            axios.get(url)
                .then(res => {
                    // console.log(res)
                    this.products = res.data.products
                })
                .catch(err => {
                    console.error(err);
                })
        },
        getCart() {
            const url = `${apiUrl}api/${apiPath}/cart`
            axios.get(url)
                .then(res => {
                    // console.log(res)
                    this.cart = res.data.data.carts
                    const {total, final_total} = res.data.data
                    this.orderPrice.total = total;
                    this.orderPrice.final_total = final_total
                })
                .catch(err => {
                    console.error(err);
                })
        },
        addToCart(id, qty = 1) {
            // console.log(id) //product id
            // https://vue3-course-api.hexschool.io/v2/api/scott/cart
            const url = `${apiUrl}api/${apiPath}/cart`
            const data = {
                "data": {
                    "product_id": id,
                    "qty": qty
                }
            }
            this.isLoading = id
            axios.post(url, data)
                .then(res => {
                    // console.log('axios',id)
                    // console.log('add to cart', res)
                    this.getCart()
                    this.isLoading = ''
                    alert(res.data.message)
                })
                .catch(err => {
                    console.error(err);
                })

        },
        updateCartItem(item) {
            const url = `${apiUrl}api/${apiPath}/cart/${item.id}`
            const data = {
                "data": {
                    "product_id": item.product.id,
                    "qty": item.qty
                }
            }
            // this.isLoading = id
            axios.put(url, data)
                .then(res => {
                    // this.getCart()
                    // this.isLoading = ''
                    this.getCart()
                    console.log(res.data.message)
                })
                .catch(err => {
                    console.error(err);
                })
        },

        openProductModal(id) {
            // console.log(this.$refs.userProductModal)
            this.targetId = id
            this.$refs.userProductModal.openProductModal()
        },
        removeCartItem(id) {
            // https://vue3-course-api.hexschool.io/v2/api/scott/cart/%22-Mw51OkPVZEHzplix6y1%22
            // console.log('remove', id)
            this.isLoading = id
            axios.delete(`${apiUrl}api/${apiPath}/cart/${id}`)
                .then(res => {
                    console.log(res)
                    alert(res.data.message)
                    this.getCart()
                    this.isLoading = ''
                })
                .catch(err => {
                    console.error(err);
                })
        },
        clearCart() {
            axios.delete(`${apiUrl}api/${apiPath}/carts`)
                .then(res => {
                    console.log(res)
                    alert(res.data.message)
                    this.getCart()
                })
                .catch(err => {
                    console.error(err);
                })
        },
        // 送出訂單
        submitOrder() {
            console.log('submitOrder')
            const data = {
                "data": {
                    ...this.formInfo
                    
                }
            }
            console.log(data)
            const url = `${apiUrl}api/${apiPath}/order`
            axios.post(url,data)
            .then(res => {
                console.log(res)
                alert(res.data.message)
                this.cart = {}
            })
            .catch(err => {
                console.error(err); 
            })

        },
        // 電話格式驗證
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        }

    },
    mounted() {
        this.getProducts()
        this.getCart()


    }
});



app.component('userProductModal', {
    props: ['id'],
    watch: {
        id() {
            this.innerId = this.id
            this.getProduct()
        }
    },
    data() {
        return {
            productModal: '',
            product: {},
            innerId: '',
            qty: null
        }
    },
    template: '#userProductModal',
    methods: {
        openProductModal() {
            this.productModal.show()

        },
        // get target product
        getProduct() {
            // https://vue3-course-api.hexschool.io/v2/api/scott/product/-MuA5NCU-x5SPj-J8RJT
            // https://vue3-course-api.hexschool.io/v2/api/scott/product/-MuA5NCU-x5SPj-J8RJT

            const url = `https://vue3-course-api.hexschool.io/v2/api/scott/product/${this.innerId}`
            axios.get(url)
                .then(res => {
                    console.log(res)
                    this.product = res.data.product
                })
                .catch(err => {
                    console.error(err);
                })
        },
        innerAdd() {
            this.$emit('add-to-cart', this.innerId, this.qty)
            this.productModal.hide()
        }


    },
    mounted() {
        this.productModal = new bootstrap.Modal(this.$refs.modal)
    }
});


app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app')