import '@babel/polyfill';
import axios from 'axios';
import { showAlert, hideAlert } from './alert';

export const signup = async(name, email, password, passwordConfirm) => {
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if(res.data.status === 'success'){
            showAlert('success', 'You are sign in successfully!');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500);
        }
    } catch(err) {
        console.log(err);
    }
};