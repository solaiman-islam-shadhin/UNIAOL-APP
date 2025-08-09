import * as Yup from "yup"; 

export const ValidationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
    email: Yup.string().email('Invalid email Format').required('Required'),
    password: Yup.string()
      .min(8, ' Password must be at least 8 characters')
      .max(50, 'Too Long!')
      .required('Required'),
});
export default ValidationSchema;