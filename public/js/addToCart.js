import axios from 'axios';
import { showAlert } from './alert';

export const updateCartDetails = async (data) => {
    try{
        const url = '/api/v1/users/addCartProduct';
        
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if(res.data.status === 'success') {
            showAlert('success', `Items added to cart`);
            location.href = '/cart';
        }
    } catch(err) {
        showAlert('error', err.response.data.message);
        location.href = '/cart';
    }
};

export const updateCartQuantity = async (data) => {
    try{
        const url = '/api/v1/users/updateQuantityProduct';
        
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if(res.data.status === 'success') {
            showAlert('success', `Items quantity updated`);
            location.href = '/cart';
        }
    } catch(err) {
        showAlert('error', err.response.data.message);

    }
};

export const deleteCartProduct = async (data) => {
    try{
        const url = '/api/v1/users/deleteCartProduct';
        
        const res = await axios({
            method: 'DELETE',
            url,
            data
        });

        if(res.data.status === 'success') {
            showAlert('success', `Item removed from cart`);
            location.href = '/cart';
        }
    } catch(err) {
        showAlert('error', err.response.data.message);

    }
};