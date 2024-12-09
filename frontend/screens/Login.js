import React, { Fragment } from 'react';
import {
    StyleSheet,
    ImageBackground,
    Dimensions,
    StatusBar,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    Alert,
    Modal,
    View,
    Pressable,
    BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Block, Checkbox, Text, Button as GaButton, theme } from 'galio-framework';
import { Button, Icon, Input } from '../components';
import { Input as EInput } from 'react-native-elements'
import { Images, nowTheme } from '../constants';
import { checkPhoneNumber, requestLoginUSer, registerUser } from '../store/actions/user'
import { connect } from 'react-redux';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaVerifier } from 'expo-firebase-recaptcha';
import moment from 'moment';

const { width, height } = Dimensions.get('screen');

const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>
);

let recaptchaVerifier = null
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            otp: '',
            fullname: '',
            modalRegister: false,
            modalSuccess: false,
            modalRecaptcha: false,
            isExistsLog: false,
            isExistsReg: false,            
            firebaseConfig: {
                apiKey: "",
                authDomain: "aicoffee.firebaseapp.com",
                projectId: "aicoffee",
                storageBucket: "aicoffee.firebasestorage.app",
                messagingSenderId: "201194383559",
                appId: "1:201194383559:web:171a27d991e954607cf6e2",
                measurementId: "G-P0HR475M80"
            }
        }
    }

    backAction = () => {
        const { navigation, route } = this.props
        Alert.alert("Wait!", "Logout?", [
            {
                text: "No",
                onPress: () => null,
                style: "cancel"
            },
            // { text: "Có", onPress: () => BackHandler.exitApp() }
            { text: 'Yes', onPress: () => { navigation.navigate("Onboarding") } }
        ]);
        return true;
    };

    navigationAction = () => {
        const { navigation } = this.props

        // console.log(this.state.phone)

        navigation.navigate('App', {
            username: this.state.phone
        })
    }

    handleCheckPhone = async () => {
        this.setState({
            // modalRecaptcha: !this.state.modalRecaptcha
        }, () => {
            const {
                phone
            } = this.state

            let err = 0

            if (phone === '') {
                err = 1
                Alert.alert('Alert', `Please input Phone !`, [
                    {
                        text: 'Back',
                        style: 'cancel',
                    },
                ]);
            }

            else if (phone.includes('+84')) {
                err = 2
                Alert.alert('Alert', `Please do not input +84!`, [
                    {
                        text: 'Back',
                        style: 'cancel',
                    },
                ]);
            }

            if (err === 0) {
                this.props.oncheckPhoneNumber(phone, response => {
                    // console.log(response)
                    if (response['username'] === 'not_exists') {
                        Alert.alert('Alert', `Phone not exists !\nPlease register !`, [
                            {
                                text: 'Back',
                                style: 'cancel',
                            },
                        ]);
                    }
                    else {
                        this.signinLog()
                    }
                })
            }
        })
    }

    handleRequestOTP = async () => {
        const {
            phone,
            otp,
            firebaseConfig,
            fullname,
        } = this.state

        let err = 0

        if (phone === '') {
            err = 1
            Alert.alert('Alert', `Please input Phone !`, [
                {
                    text: 'Back',
                    style: 'cancel',
                },
            ]);
        }

        else if (phone.includes('+84')) {
            err = 3
            Alert.alert('Alert', `Please do not input +84!`, [
                {
                    text: 'Back',
                    style: 'cancel',
                },
            ]);
        }

        else if (fullname === '') {
            err = 2
            Alert.alert('Alert', `Please input Name !`, [
                {
                    text: 'Back',
                    style: 'cancel',
                },
            ]);
        }
        if (err === 0) {
            await this.props.oncheckPhoneNumber(phone, response => {
                // console.log(response)
                if (response['username'] !== 'not_exists') {
                    Alert.alert('Alert', `Phone existed !\nPlease Login !`, [
                        {
                            text: 'Back',
                            style: 'cancel',
                        },
                    ]);
                }
                else {
                    this.signin()
                }
            })
        }
    }

    signinLog = () => {
        // Promise.all(
        //   <FirebaseRecaptchaVerifierModal
        //     ref={r => {recaptchaVerifier = r}}
        //     firebaseConfig={this.state.firebaseConfig}
        //     attemptInvisibleVerification={true}
        //   />
        // )
        // .then(

        // );


        // const { recaptchaToken } = this.state;
        // if (!recaptchaToken) return;
        // const applicationVerifier = new FirebaseRecaptchaVerifier(recaptchaToken);
        console.log('Tới đây')
        firebase.auth().signInWithPhoneNumber('+84' + this.state.phone, recaptchaVerifier)
            .then(result => {
                console.log('Successfull !')
                this.setState({
                    isExistsLog: true,
                    result,
                    step: "VERIFY_OTP"
                });
            })
            .catch((err) => {
                console.log('Lỗi')
                console.log(err); // Mở rộng thêm
            })

    }

    signin = () => {
        firebase.auth().signInWithPhoneNumber('+84' + this.state.phone, recaptchaVerifier)
            .then(result => {
                this.setState({
                    isExistsReg: true,
                    result,
                    step: "VERIFY_OTP"
                });
            })
            .catch((err) => {
                console.log(err); // Mở rộng thêm
            })
    }

    ValidateOtpLog = () => {
        const { otp, phone, fullname } = this.state;
        const { navigation, optionLeft, optionRight } = this.props;
        // console.log(this.state.phone)
        // console.log(this.state.fullname)
        if (otp === null) return;
        // console.log(this.state.result)
        this.state.result.confirm(otp).then((result) => {
            this.setState({
                step: "VERIFY_SUCCESS",
                username: phone
            }, async () => {
                await AsyncStorage.setItem(
                    "@username", phone
                );
                this.navigationAction()
            }) // Thay bằng hàm login
        })
            .catch((err) => {
                console.log(err)
                alert("Incorrect code");
                // dispatch({
                //   type: GET_ERRORS,
                //   payload: err
                // })

            })

        // const credential = firebase.auth.PhoneAuthProvider.credential(this.state.result.verificationId, otp)
        // console.log(credential)
    }

    ValidateOtp = () => {
        const { otp, phone, fullname } = this.state;
        const { navigation } = this.props
        // console.log(this.state.phone)
        // console.log(this.state.fullname)
        if (otp === null) return;
        // console.log(this.state.result)
        this.state.result.confirm(otp).then((result) => {
            this.setState({
                step: "VERIFY_SUCCESS",
            }, () => {
                this.props.onregisterUser(phone, fullname, response => {
                    // console.log(response)
                    this.setState({
                        result,
                        modalRegister: !this.state.modalRegister,
                        modalSuccess: !this.state.modalSuccess,
                        phone: response.username,
                        username: response.username,
                    }, () => {
                        setTimeout(() => {
                            this.setState({
                                modalSuccess: !this.state.modalSuccess
                            })
                        }, 2000)
                        this.navigationAction()
                    })
                })
            }) // Thay bằng hàm login
        })
            .catch((err) => {
                console.log(err)
                alert("Incorrect code");
                // dispatch({
                //   type: GET_ERRORS,
                //   payload: err
                // })

            })

        // const credential = firebase.auth.PhoneAuthProvider.credential(this.state.result.verificationId, otp)
        // console.log(credential)
    }

    renderRecaptcha = () => {
        const {
            firebaseConfig
        } = this.state

        //  console.log('OK')
        return (
            <FirebaseRecaptchaVerifierModal
                ref={r => { recaptchaVerifier = r }}
                firebaseConfig={firebaseConfig}
                attemptInvisibleVerification={true}
            />
        )
    }

    render() {
        const {
            // phone,
            // otp,
            isExistsLog,
            isExistsReg,
            modalRegister,
            modalSuccess,
            modalRecaptcha,
            // fullname,            
        } = this.state

        // console.log('Render lại')

        return (
            <Fragment>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalSuccess}
                    // key={this.state.data2['index']}
                    onRequestClose={() => {
                        // Alert.alert('Modal has been closed.');
                        // this.setModalVisible(!modalSuccess);
                        this.setState({
                            modalSuccess: !this.state.modalSuccess
                        })
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Successfully !</Text>
                            <Block row center space="between">
                                <View>
                                    <Image
                                        source={require('../assets/iconsuccess.png')}
                                        style={{ height: 50, width: 50 }}
                                    />
                                </View>
                            </Block>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalRegister}
                    onRequestClose={() => {
                        // Alert.alert('Modal has been closed.');
                        this.setState({
                            modalRegister: !this.state.modalRegister
                        })
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <this.renderRecaptcha />
                            <Text style={styles.modalText}>
                                {moment().utcOffset('+07:00').format('HH:mm - DD/MM/YYYY')}
                            </Text>
                            <Block center>
                                <Block width={width * 0.8} style={{ marginBottom: 0 }}>
                                    <EInput
                                        placeholder="Phone"
                                        // label="Số điện thoại"
                                        value={this.state.phone}
                                        inputStyle={{ backgroundColor: 'white', paddingLeft: 10, borderRadius: 30 }}
                                        inputContainerStyle={{ fontSize: 16, borderColor: '#006464', borderRadius: 30, borderWidth: 2 }}
                                        onChangeText={phone => { this.setState({ phone }) }}
                                    />
                                </Block>
                                <Block width={width * 0.8} style={{ marginBottom: 0 }}>
                                    <EInput
                                        placeholder="Name"
                                        // label="Số điện thoại"
                                        value={this.state.fullname}
                                        inputStyle={{ backgroundColor: 'white', paddingLeft: 10, borderRadius: 30 }}
                                        inputContainerStyle={{ fontSize: 16, borderColor: '#006464', borderRadius: 30, borderWidth: 2 }}
                                        onChangeText={fullname => { this.setState({ fullname }) }}
                                    />
                                </Block>
                                {isExistsReg && (
                                    <Block width={width * 0.8} style={{ marginBottom: 0 }}>
                                        <EInput
                                            placeholder="Mã OTP"
                                            // label="Số điện thoại"
                                            value={this.state.otp}
                                            inputStyle={{ backgroundColor: 'white', paddingLeft: 10, borderRadius: 30 }}
                                            inputContainerStyle={{ fontSize: 16, borderColor: '#006464', borderRadius: 30, borderWidth: 2 }}
                                            onChangeText={otp => this.setState({ otp })}
                                        />
                                    </Block>
                                )}
                            </Block>
                            <Block row center space="between" style={{ marginTop: -20 }}>
                                {!isExistsReg ? (
                                    <Button
                                        round
                                        style={styles.buttonSubmit}
                                        onPress={() => { this.handleRequestOTP() }}>
                                        <Text
                                            style={{ fontFamily: 'montserrat-bold' }}
                                            size={16}
                                            color={nowTheme.COLORS.WHITE}
                                        >
                                            Request OTP
                                        </Text>
                                    </Button>
                                ) : (
                                    <Button
                                        round
                                        style={styles.buttonSubmit}
                                        onPress={() => { this.ValidateOtp() }}>
                                        <Text
                                            style={{ fontFamily: 'montserrat-bold' }}
                                            size={16}
                                            color={nowTheme.COLORS.WHITE}
                                        >
                                            Register
                                        </Text>
                                    </Button>
                                )}

                                <Text>{'  '}</Text>
                                <Button
                                    round
                                    style={styles.buttonClose}
                                    onPress={() => {
                                        this.setState({
                                            modalRegister: !this.state.modalRegister
                                        })
                                    }}>
                                    <Text
                                        style={{ fontFamily: 'montserrat-bold' }}
                                        size={14}
                                        color={nowTheme.COLORS.WHITE}
                                    >
                                        Cancel
                                    </Text>
                                </Button>
                            </Block>
                        </View>
                    </View>
                </Modal>
                <Block flex middle>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalRecaptcha}
                    // key={this.state.data2['index']}
                    // onRequestClose={() => {
                    //   this.setState({
                    //   })
                    // }}
                    >
                        <this.renderRecaptcha />

                        <Block flex middle>
                            <Block style={styles.registerContainer}>
                                <Block flex={0.3} middle>
                                    <Image
                                        source={Images.Logo}
                                        style={{ height: '95%', width: '80%', marginTop: 30 }}
                                    />
                                </Block>
                                <Block flex={0.7} middle space="between">
                                    <Block center flex={1}>
                                        <Block width={width * 0.8} style={{ marginBottom: 0 }}>
                                            <EInput
                                                placeholder="Phone Number"
                                                // label="Số điện thoại"
                                                value={this.state.phone}
                                                inputStyle={{ backgroundColor: 'white', marginTop: 55, paddingLeft: 10, borderRadius: 30 }}
                                                inputContainerStyle={{ fontSize: 16, borderColor: '#006464', borderRadius: 30 }}
                                                onChangeText={phone => this.setState({ phone })}
                                            />
                                        </Block>
                                        {isExistsLog && (
                                            <Block width={width * 0.8} style={{ marginBottom: 0 }}>
                                                <EInput
                                                    placeholder="OTP Code"
                                                    // label="Số điện thoại"
                                                    value={this.state.otp}
                                                    inputStyle={{ backgroundColor: 'white', paddingLeft: 10, borderRadius: 30 }}
                                                    inputContainerStyle={{ fontSize: 16, borderColor: '#006464', borderRadius: 30 }}
                                                    onChangeText={otp => this.setState({ otp })}
                                                />
                                            </Block>
                                        )}
                                        <Block center>
                                            {!isExistsLog ? (
                                                <Fragment>
                                                    <Button
                                                        round
                                                        style={styles.createButton}
                                                        onPress={() => { this.handleCheckPhone() }}
                                                    >
                                                        <Text
                                                            style={{ fontFamily: 'montserrat-bold' }}
                                                            size={16}
                                                            color={nowTheme.COLORS.WHITE}
                                                        >
                                                            Request OTP
                                                        </Text>
                                                    </Button>
                                                </Fragment>
                                            ) : (
                                                <Fragment>
                                                    <Button
                                                        round
                                                        style={styles.createButton}
                                                        onPress={() => { this.ValidateOtpLog() }}
                                                    >
                                                        <Text
                                                            style={{ fontFamily: 'montserrat-bold' }}
                                                            size={16}
                                                            color={nowTheme.COLORS.WHITE}
                                                        >
                                                            Login
                                                        </Text>
                                                    </Button>
                                                </Fragment>
                                            )}

                                            <Button round style={styles.registerButton}>
                                                <Text
                                                    style={{ fontFamily: 'montserrat-bold' }}
                                                    size={14}
                                                    color={nowTheme.COLORS.WHITE}
                                                    onPress={
                                                        () => {
                                                            this.setState({
                                                                modalRegister: !this.state.modalRegister
                                                            })
                                                        }}
                                                >
                                                    Register ?
                                                </Text>
                                            </Button>
                                        </Block>
                                    </Block>
                                </Block>
                            </Block>
                        </Block>

                    </Modal>
                </Block>
            </Fragment>
        );
    }

    componentDidUpdate() {
        // console.log('route', this.props.route)
        // console.log('navigation', this.props.navigation)
        // firebase.auth().signOut();
        // console.log('Back nè !')
        // this.setState({
        //   modalRecaptcha: false
        // },() => {
        //   setTimeout(() => {
        //     this.setState({
        //       modalRecaptcha: true
        //     })
        //   }, 200)
        // })
    }

    componentDidMount() {

        const firebaseConfig = {
            apiKey: "AIzaSyBsU-F7oQkw-pg4leXnDTjWZm1evlYEUTM",
            authDomain: "aicoffee.firebaseapp.com",
            projectId: "aicoffee",
            storageBucket: "aicoffee.firebasestorage.app",
            messagingSenderId: "201194383559",
            appId: "1:201194383559:web:171a27d991e954607cf6e2",
            measurementId: "G-P0HR475M80"
        };

        firebase.initializeApp(firebaseConfig);

        // const { navigation, route } = this.props
        // console.log('isReload: ', route)

        // this.BackHandler = BackHandler.addEventListener(
        //   "hardwareBackPress",
        //   this.backAction
        // )

        this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // console.log('Signed In !')
                this.setState({
                    user: user.toJSON(),
                    modalRecaptcha: false
                }, () => {
                    this.navigationAction()
                    // setTimeout(() => {
                    //   this.setState({
                    //     modalRecaptcha: true
                    //   }, () => {})
                    // }, 500)
                });
            } else {
                // User has been signed out, reset the state
                console.log('Signed Out !')
                this.setState({
                    user: null,
                    message: '',
                    codeInput: '',
                    phoneNumber: '+84',
                    confirmResult: null,
                    modalRecaptcha: true
                }, () => {
                    // setTimeout(() => {
                    //   this.setState({
                    //     modalRecaptcha: true
                    //   }, () => { })
                    // }, 500)
                });
            }
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe();
        // this.willFocusListener.remove()
        // this.BackHandler = BackHandler.addEventListener(
        //   "hardwareBackPress",
        //   this.backAction
        // )
    }
}

const styles = StyleSheet.create({
    imageBackgroundContainer: {
        width: width,
        height: height,
        padding: 0,
        zIndex: 1,
    },
    imageBackground: {
        width: width,
        height: height
    },
    registerContainer: {
        marginTop: 0,
        width: width * 1,
        height: height < 812 ? height * 1 : height * 1,
        backgroundColor: nowTheme.COLORS.WHITE,
        // backgroundColor: 'transparent',
        // borderRadius: 4,
        // shadowColor: nowTheme.COLORS.BLACK,
        // shadowOffset: {
        //   width: 0,
        //   height: 4
        // },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 1,
        overflow: 'hidden'
    },
    socialConnect: {
        backgroundColor: nowTheme.COLORS.WHITE
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderColor: "rgba(136, 152, 170, 0.3)"
    },
    socialButtons: {
        width: 120,
        height: 40,
        backgroundColor: '#fff',
        shadowColor: nowTheme.COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 1
    },
    socialTextButtons: {
        color: nowTheme.COLORS.PRIMARY,
        fontWeight: '800',
        fontSize: 14
    },
    inputIcons: {
        marginRight: 12,
        color: nowTheme.COLORS.ICON_INPUT
    },
    inputs: {
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 21.5
    },
    passwordCheck: {
        paddingLeft: 2,
        paddingTop: 6,
        paddingBottom: 15
    },
    createButton: {
        width: width * 0.75,
        marginTop: 30,
        marginBottom: 40,
        backgroundColor: '#006464'
    },
    registerButton: {
        width: width * 0.75,
        marginTop: height / 15,
        // marginBottom: 10,
        backgroundColor: '#00B991'
    },
    social: {
        width: theme.SIZES.BASE * 3.5,
        height: theme.SIZES.BASE * 3.5,
        borderRadius: theme.SIZES.BASE * 1.75,
        justifyContent: 'center',
        marginHorizontal: 10
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        // margin: 30,
        backgroundColor: '#E5F3F3',
        borderRadius: 20,
        // padding: 35,

        width: width - theme.SIZES.BASE * 3,
        paddingVertical: theme.SIZES.BASE * 2,
        paddingHorizontal: 0,

        // alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        color: 'red'
    },
    button: {
        borderRadius: 20,
        padding: 15,
        elevation: 2,
        width: 100,
    },
    buttonSubmit: {
        width: width * 0.3,
        marginTop: 30,
        marginBottom: 40,
        backgroundColor: '#006464'
    },
    buttonClose: {
        width: width * 0.3,
        marginTop: 30,
        marginBottom: 40,
        backgroundColor: '#8B8B8B'
    },
    buttonDelete: {
        backgroundColor: '#FF3636',
    },
});

const mapStateToProps = state => {
    return {
        auth: state.auth,
        errors: state.errors,
        user: state.user
    };
};

const mapDispatchToProps = dispatch => {
    return {
        oncheckPhoneNumber: (phone, callback) => {
            dispatch(checkPhoneNumber(phone, callback))
        },
        onrequestLoginUSer: ({ username, password, fingerprint }) => {
            dispatch(requestLoginUSer({ username, password, fingerprint }))
        },
        onregisterUser: (username, fullname, callback) => {
            dispatch(registerUser(username, fullname, callback))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);
