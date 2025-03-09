import { useEffect, useContext } from 'react';
import { BackHandler } from 'react-native';
import AuthContext from '../context/AuthContext';

const useBackButtonHandler = (isExitScreen, dependencies = []) => {
    const { setAlertTitle, setAlertMessage, setAlertType, setAlertVisible, setAlertOnConfirm, setAlertOnCancel } = useContext(AuthContext);

    useEffect(() => {
        const backAction = () => {
            if (isExitScreen) {
                setAlertTitle("Hold on!");
                setAlertMessage("Do you really want to exit the app?");
                setAlertType("exit");
                setAlertOnConfirm(() => {
                    setAlertVisible(false);
                    BackHandler.exitApp();
                });
                setAlertOnCancel(() => setAlertVisible(false));
                setAlertVisible(true);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [isExitScreen, setAlertTitle, setAlertMessage, setAlertType, setAlertVisible, setAlertOnConfirm, setAlertOnCancel, ...dependencies]);
};

export default useBackButtonHandler;
