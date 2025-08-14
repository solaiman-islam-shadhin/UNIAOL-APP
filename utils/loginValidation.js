import * as Yup from "yup"; 

export const loginValidationScema = Yup.object().shape({
    email: Yup.string().email('Invalid email Format').required('Required'),
    password: Yup.string()
      .min(8, ' Password must be at least 8 characters')
      .max(50, 'Too Long!')
      .required('Required'),
});
export default loginValidationScema;