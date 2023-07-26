import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { signup } from './signup';
import { orderItem } from './stripe';
import { updateCartDetails, updateCartQuantity, deleteCartProduct } from './addToCart';
import { showAlert } from './alert';
// DOM ELEMENTS

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const signinForm = document.querySelector('.form--signup');
const signinBtn = document.querySelector('.nav__el--cta');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('order-btn');
const category = document.querySelector('.category');
const aside = document.querySelector('.aside');
const sortProduct = document.querySelector('.card-box-head-sort');
const pagei = document.querySelector('.card-box-footer ');
const search = document.querySelector('.nav__search');
const cartButtonP = document.querySelector('.main-product-cart-btn');
// update quantity
const cartBody = document.querySelector('.main-cart-body-i');

// DELEGATION

if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
        
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    })
}

if(signinForm) {
    signinForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm,);
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('passwordConfirm').value = '';
    })
}


if(logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if(userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        // const name = document.getElementById('name').value;
        // const email = document.getElementById('email').value;
        // updateSettings({name, email}, 'data');
        updateSettings(form, 'data');
    });
}

if(userPasswordForm) {
    userPasswordForm.addEventListener('submit', 
    async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const password = document.getElementById('password-current').value;
        const chpswd = document.getElementById('password').value;
        const chpswdConfirm = document.getElementById('password-confirm').value;
        await updateSettings(
            {password, chpswd, chpswdConfirm}, 
            'password'
        );
        
        document.querySelector('.btn--save-password').textContent = 'Save password';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

// {
//     "password": "test1234",
//     "chpswd": "test12345",
//     "chpswdConfirm": "test12345"
// }


///////////////////////////////////////////////////////////////////////////////
///////////////////////////// Overview page functions /////////////////////////
/////////////////////////////////////////////////////////////////////////////// 

if(aside || sortProduct) {
    if(window.location.href.split('?')[1]) {
        const ele = window.location.href.split('?')[1].split('&');
        ele.map((el) => {
            const tempKey = el.split('=')[0];
            // console.log(tempKey);
            const tempValue = el.split('=')[1];
            if(tempKey === "average_rating[gte]") {
            document.getElementById(`inputRating${tempValue}`).checked = true;
            }
            else if( tempKey === "selling_price[gte]") {
                document.getElementById(`inputPrice${+tempValue >= 2000 ? `5`: `${Math.floor(+tempValue / 500 + 1)}`}`).checked = true;
            } 
            else if( tempKey === "discount[gte]") {
                document.getElementById(`inputDiscount${tempValue}`).checked = true;
            }
            else if( tempKey === "brand") {
                document.getElementById(`inputBrand${tempValue.replace('%20', '_')}`).checked = true;
            }
            else if( tempKey === "out_of_stock") {
                document.getElementById('inputAvail').checked = true;
            }
            else if( tempKey === "sort") {
                // remove the active class from the all
                document.querySelector('.card-box-head-sort-row-active').classList.toggle('card-box-head-sort-row-active');
                // add active class to current sort
                document.querySelector(`.card-box-head-sort-Price-${tempValue}`).classList.toggle('card-box-head-sort-row-active');
            }
        })
    }
}


// for category
if(category){
    category.addEventListener('click', function(e){
        let element;
        if(e.target.classList.contains('category--common-link')) {
            element = e.target.closest('.category--common-link');
        }

        // no element
        if(!element)
            return;

        // for all tag in category section
        if(element.classList.contains('category--common-all')) {
            element.setAttribute("href", `/`);
            return;
        }

        // for getting the current attribute
        const value = element.getAttribute('data-category');
        let filteredUrl
        if(window.location.href.split('?')[1]){
            // getting the query parameters
            const currUrl = window.location.href.split('?')[1].split('&');
            // for filtering the current query present
            filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'sub_category').join('&');
        }
        element.setAttribute("href", `/?sub_category=${value}${filteredUrl? `&${filteredUrl}`:''}`);
    })
}

// for filter
if(aside) {
    aside.addEventListener('click', function(e){
        
        // for head
        const element = e.target.closest('.aside-filter-row-head');
        if(element) {
            const ele = element.closest('.aside-filter-row')
            // toggle the body of filter
            ele.querySelector('.aside-filter-row-body').classList.toggle('aside-display');
            // change the up svg
            ele.querySelector('.aside-filter-row-head-up').classList.toggle('aside-display');
            // change the down svg
            ele.querySelector('.aside-filter-row-head-down').classList.toggle('aside-display');
        }
        
        // for body action
        if(e.target.classList.contains('aside-filter-row-filter-reset')) {
            let filteredUrl;
            if(window.location.href.split('?')[1]){
                // getting the query parameters
                const currUrl = window.location.href.split('?')[1].split('&');
                filteredUrl = currUrl.filter((el) => el.split('=')[0] === 'sub_category').join('&');
            }
            location.href = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
            return;
        }
        const eleValue = e.target.closest('.aside-filter-row-body');
        if(eleValue){

            // for rating
            if(eleValue.classList.contains('aside-rating')){
                
                if(e.target.closest('.aside-filter-row-body-label')){
                    const ele = e.target.closest('.aside-filter-row-body-label');
                    const value = ele.querySelector('input').getAttribute('data-rating');
                    // console.log(ele, value)
                    let filteredUrl;
                    let undoChangeUrl;
                    if(window.location.href.split('?')[1]){
                        // getting the query parameters
                        const currUrl = window.location.href.split('?')[1].split('&');
                        filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'average_rating[gte]').join('&');
                        currUrl.map((el) => {
                            if(el.split('=')[1] === value) {
                                undoChangeUrl = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                                return;
                            }
                        })
                    }
                    if(undoChangeUrl) {
                        location.href = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                    } else {
                        location.href = `/?average_rating[gte]=${+value}${filteredUrl? `&${filteredUrl}`:''}`;
                    }
                }
            }

            // for price
            else if(eleValue.classList.contains('aside-price')){
                if(e.target.closest('.aside-filter-row-body-label')){
                    const ele = e.target.closest('.aside-filter-row-body-label');
                    const value = ele.querySelector('input').getAttribute('data-price');
                    // console.log(ele, value)
                    let filteredUrl;
                    let undoChangeUrl;
                    if(window.location.href.split('?')[1]){
                        // getting the query parameters
                        const currUrl = window.location.href.split('?')[1].split('&');
                        filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'selling_price[gte]');
                        filteredUrl = filteredUrl.filter((el) => el.split('=')[0] !== 'selling_price[lt]').join('&');
                        currUrl.map((el) => {
                            if(el.split('=')[1] === value.split(',')[0] || el.split('=')[1] === value.split(',')[1]) {
                                undoChangeUrl = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                                return;
                            }
                        })

                    }
                    if(undoChangeUrl) {
                        location.href = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                    } else {
                        location.href = `/?selling_price[gte]=${+value.split(',')[0]}${+value.split(',')[1]? `&selling_price[lt]=${+value.split(',')[1]}`: ''}${filteredUrl? `&${filteredUrl}`:''}`;
                    }
                }
            }

            // for discount
            else if(eleValue.classList.contains('aside-discount')){
                if(e.target.closest('.aside-filter-row-body-label')){
                    const ele = e.target.closest('.aside-filter-row-body-label');
                    const value = ele.querySelector('input').getAttribute('data-discount');
                    let filteredUrl;
                    let undoChangeUrl;
                    if(window.location.href.split('?')[1]){
                        // getting the query parameters
                        const currUrl = window.location.href.split('?')[1].split('&');
                        filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'discount[gte]').join('&');
                        currUrl.map((el) => {
                            if(el.split('=')[1] === value) {
                                undoChangeUrl = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                                return;
                            }
                        })
                    }
                    if(undoChangeUrl) {
                        location.href = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                    } else {
                        location.href = `/?discount[gte]=${+value}${filteredUrl? `&${filteredUrl}`:''}`;
                    }
                }
            }
            else if(eleValue.classList.contains('aside-brand')){
                if(e.target.closest('.aside-filter-row-body-label')){
                    const ele = e.target.closest('.aside-filter-row-body-label');
                    const value = ele.querySelector('input').getAttribute('data-brand');
                    let filteredUrl;
                    let undoChangeUrl;
                    if(window.location.href.split('?')[1]){
                        // getting the query parameters
                        const currUrl = window.location.href.split('?')[1].split('&');
                        filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'brand').join('&');
                        currUrl.map((el) => {
                            if(el.split('=')[1].replace("%20", " ") === value) {
                                undoChangeUrl = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                                return;
                            }
                        })
                    }
                    if(undoChangeUrl) {
                        location.href = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                    } else {
                        location.href = `/?brand=${value}${filteredUrl? `&${filteredUrl}`:''}`;
                    }
                }
            }
            else if(eleValue.classList.contains('aside-avail')){
                if(e.target.closest('.aside-filter-row-body-label')){
                    const ele = e.target.closest('.aside-filter-row-body-label');
                    const value = ele.querySelector('input').getAttribute('data-avail');
                    let filteredUrl;
                    let undoChangeUrl;
                    if(window.location.href.split('?')[1]){
                        // getting the query parameters
                        const currUrl = window.location.href.split('?')[1].split('&');
                        filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'out_of_stock').join('&');
                        currUrl.map((el) => {
                            if(el.split('=')[1] === value) {
                                undoChangeUrl = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                                return;
                            }
                        })
                    }
                    if(undoChangeUrl) {
                        location.href = `${filteredUrl? `/?${filteredUrl}`:'/'}`;
                    } else {
                        location.href = `/?out_of_stock=${value === "false"? false: true}${filteredUrl? `&${filteredUrl}`:''}`;
                    }
                }
            }
        }
    })
}

// for sort
if(sortProduct) {
    sortProduct.addEventListener('click', function(e){

        if(e.target.classList.contains('card-box-head-sort-row')) {
            // first disable the active class
            const element = e.target.closest('.card-box-head-sort').querySelector('.card-box-head-sort-row-active');
            element.classList.toggle('card-box-head-sort-row-active');

            // mount new active class
            e.target.classList.toggle('card-box-head-sort-row-active');

            const value = e.target.getAttribute('data-sort');
            let filteredUrl
                    if(window.location.href.split('?')[1]){
                        // getting the query parameters
                        const currUrl = window.location.href.split('?')[1].split('&');

                        filteredUrl = currUrl.filter((el) => el.split('=')[0] !== 'sort').join('&');
                        if(e.target.classList.contains('card-box-head-sort-all')){
                            location.href = `/${filteredUrl? `?${filteredUrl}`:''}`;
                            return;
                        }
                    }
                    location.href = `/?sort=${value}${filteredUrl? `&${filteredUrl}`:''}`;
        }
    })
}

// Paginate
if(pagei) {
    const data = pagei.querySelector('.card-box-footer-body').getAttribute('data-page');
    let prev = document.querySelector('.card-box-footer-body-prev');
    prev = prev.querySelector('a');
    let next = document.querySelector('.card-box-footer-body-next');
    next = next.querySelector('a');
    const currPage = +data.split(',')[0];
    const totalPage = +data.split(',')[1];
    // console.log(currPage, totalPage);
    let url;
    if(window.location.href.split('?')[1]){
        url = window.location.href.split('?')[1];
        if(url.split('&')){
            url = url.split('&').filter((el) => el.split('=')[0] != "page").join('&')
        }
    }

    if(totalPage > 0) {
        if(currPage > 1) {
            prev.setAttribute("href", `/?page=${currPage - 1}${url? `&${url}`: ''}`);
        } else {
            prev.closest('.card-box-footer-body-prev').style.backgroundColor = '#e5e6e7';
        }
        if(totalPage - currPage > 5) {
            // select link
            document.getElementById('page1').querySelector('a').setAttribute("href", `/?page=${currPage + 1}${url? `&${url}`: ''}`)
            document.getElementById('page2').querySelector('a').setAttribute("href", `/?page=${currPage + 2}${url? `&${url}`: ''}`)
            document.getElementById('page3').querySelector('a').setAttribute("href", `/?page=${currPage + 3}${url? `&${url}`: ''}`)
            
            // set Text
            document.getElementById('page1').querySelector('a').textContent = `${currPage + 1}`;
            document.getElementById('page2').querySelector('a').textContent = `${currPage + 2}`;
            document.getElementById('page3').querySelector('a').textContent = `${currPage + 3}`;
        }
        if(currPage < totalPage) {
            next.setAttribute("href", `/?page=${currPage + 1}${url? `&${url}`: ''}`);
        } else {
            next.closest('.card-box-footer-body-next').style.backgroundColor = '#e5e6e7';
        }
    }
}

if(search) {
    search.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = search.querySelector('.nav__search-input');
        let url;
        if(window.location.href.split('?')[1]){
            url = window.location.href.split('?')[1];
            if(url.split('&')){
                url = url.split('&').filter((el) => el.split('=')[0] != "search").join('&');
            }
        }
        const searchQuery = input.value.split(' ').join('+');
        location.href = `/${searchQuery != ''? `?search=${searchQuery}`: ''}${url? `&${url}`: ''}`
        input.value = "";
    })
}

// Cart button on product details page
const select = document.querySelector('.main-product-container-text-body-size-body');
if(select) {
    let value;
    let selected = false;
    select.addEventListener('click', function(e) {
        if(e.target.classList.contains('size-scale')) {
            e.target.style.border = '1px solid orangered';
            cartButtonP.style.backgroundColor = 'orangered';
            e.target.style.border = '1px solid rgb(193, 190, 190)';
            const urlId = window.location.href.split('/');
            const id = urlId[urlId.length - 1];
            // console.log(id)
            value = {
                product: {
                    pro_id: id,
                    quantity: 1,
                    size: e.target.getAttribute('data-size')
                }
            }
            selected = true;
        }
    })
    if(cartButtonP) {
        cartButtonP.addEventListener('click', function() {
            if(selected){
                updateCartDetails(value);
            } else {
                const ele = document.querySelector('.main-product-container-text-body-size-head-l');
                const val1 = ele.textContent;
                ele.classList.toggle('display-hidden');
                window.setTimeout(function() {
                    ele.classList.toggle('display-hidden');
                }, 1500);

            }
        })
        
    }
}

if(cartBody) {
    cartBody.addEventListener('click', function(e){
        let value ;
        const item = e.target.closest('.main-cart-body-item');
        const buttonText = item.querySelector('.main-cart-body-item-quantity-text');
        if(e.target.classList.contains('main-cart-body-item-quantity-minus')) {
            const val = +buttonText.textContent - 1;
            const searchId = buttonText.getAttribute("data-id");
            value = {
                product: {
                    quantity: val
                },
                searchId: searchId
            }
            
            if(val === 0) {
                deleteCartProduct(value);
            }
            else {
                updateCartQuantity(value);
            }
        };
        if(e.target.classList.contains('main-cart-body-item-quantity-plus')) {
            const val = +buttonText.textContent + 1;
            const searchId = buttonText.getAttribute("data-id");
            // console.log(val, searchId)
            value = {
                product: {
                    quantity: val
                },
                searchId: searchId
            }
            updateCartQuantity(value);
        };
    });
}

if(bookBtn) {
    bookBtn.addEventListener('click', e => {
        // console.log(bookBtn)
        e.target.textContent = 'Processing...';
        orderItem();
    })
}

const alertMessage = document.querySelector('body').dataset.alert;
if(alertMessage) showAlert('success', alertMessage, 20);