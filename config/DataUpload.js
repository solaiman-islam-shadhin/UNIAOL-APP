
import { collection, doc, writeBatch } from 'firebase/firestore';

import CourseData from '../store/CourseData';
import { db } from './FireBAseConfig';
import { Alert } from 'react-native';


 const  uploadCourseData = async () => {
    const batch = writeBatch(db);
    const coursesCollection = collection(db, 'CourseData');
    CourseData.forEach((course) => {
      const docRef = doc(coursesCollection, course.id.toString());
      const { id, ...courseDetails } = course;
      batch.set(docRef, courseDetails);
    });

    try {
      await batch.commit();
      Alert.alert('Success!', 'All courses have been uploaded.');
    } catch (e) {
      console.error('Error uploading courses: ', e);
      Alert.alert('Error', 'Could not upload courses. Check the console.');
    }
  }
export default uploadCourseData;



