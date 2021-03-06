import styled from 'styled-components'
import { motion } from 'framer-motion'
import Colors from "../../../colors"
import { easeInOutCubicBezier } from "../../../utils"
import Button from "../common/button"
import { useState, useEffect, useContext } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { showNotification } from '../../common/notification'
import UserContext from '../../../contexts/userContext'

const SignupContainer = styled(motion.div)`
    background-color: ${Colors.offwhite};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 45%;
    max-width: 320px;
    min-width: 260px;
    position: absolute;
`

const animationTransition = {
    duration: 1,
    ease: easeInOutCubicBezier
}

const signupContainerVariant = {
    initial: {
        opacity: 0,
        y: 200
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: animationTransition
    },
    exit: {
        y: -200,
        opacity: 0,
        transition: animationTransition
    }
}

const Input = styled.input`
    padding: 8px;
    width: 90%;
    margin: 8px;
    box-sizing: border-box;
`

const fillupCurrency = (change_currency_options_list) => {
    const currency_options_list = []
    fetch("/api/getAllCurrencyCC")
        .then((response) => {
            response.json()
                .then((currencyCCList) => {
                    currencyCCList.forEach((currency_cc) => {
                        currency_options_list.push(currency_cc)
                    })
                    change_currency_options_list(currency_options_list)
                })
        })
}

export default function Signup({ changeIsLoginDisplayed }) {

    // Switches to Login panel
    const switchToLoginHandler = () => {
        changeIsLoginDisplayed(true)
    }

    // User context
    const { userContextState, fetchAndSetUserContextState } = useContext(UserContext)

    // History from Router
    const history = useHistory()

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        if (userContextState.isLoggedIn) {
            history.push("/dashboard")
        }
    }, [userContextState.isLoggedIn, history])

    // Handles filling up currency cc values
    const [currency_options_list, change_currency_options_list] = useState([])
    useEffect(() => {
        fillupCurrency(change_currency_options_list)
    }, [])

    // States for below purposes
    const [isRegisterStatusGreen, changeIsRegisterStatusGreen] = useState(false)
    const [registerStatus, changeRegisterStatus] = useState(null)
    const [isButtonGreyedOut, changeIsButtonGreyedOut] = useState(false)

    // Handles making signup request    
    const signupHandler = () => {
        changeIsButtonGreyedOut(true)
        fetch(("/api/register"), {
            credentials: "include",
            body: new FormData(document.querySelector("#signup-form")),
            method: "POST",
        })
            .then((response) => {
                response.json().then((responseJson) => {
                    if (response.ok) { // If registration was successful
                        changeIsRegisterStatusGreen(true)
                        changeRegisterStatus(responseJson.message)
                        fetchAndSetUserContextState().then(({displayName}) => {
                            showNotification(`Welcome aboard, ${displayName}!`, "success")
                            history.push("/dashboard")
                        })
                    } else { // If registration was not successful
                        changeIsRegisterStatusGreen(false)
                        changeRegisterStatus(responseJson.message)
                        changeIsButtonGreyedOut(false)
                    }
                })
            })
            .catch((err) => {
                changeIsButtonGreyedOut(false)
                isRegisterStatusGreen(false)
                changeRegisterStatus(err)
            })
    }

    // Register if Enter is pressed
    const handleKeyPress = (event) => {
        if (event.code === "Enter") {
            signupHandler()
        }
    }
    useEffect(() => {
        document.addEventListener('keypress', handleKeyPress)
        // Below callback removes the above event listener
        return () => { document.removeEventListener('keypress', handleKeyPress) }
    })

    // Handles checking if "password" and "confirm password" matches
    const passwordsValidator = (event) => {
        if (document.querySelector("#pwd").value !== event.target.value) {
            // If passwords do not match
            changeIsButtonGreyedOut(true)
            changeIsRegisterStatusGreen(false)
            changeRegisterStatus("Passwords do not match!")
        } else {
            // If passwords do match
            changeIsRegisterStatusGreen(true)
            changeRegisterStatus("Passwords match")
        }
    }

    return (
        <SignupContainer id="login-container" variants={signupContainerVariant}
            initial="initial" animate="animate" exit="exit">
            <div id="login-title" style={{ fontFamily: 'oswald', fontSize: '24px', padding: "16px" }}>
                Sign-up, it's free!
            </div>
            <form id="signup-form" style={{ textAlign: "center" }}>
                <Input name="name" type="text" placeholder="Your name" />
                <Input name="email" type="text" placeholder="Email" />
                <Input id="pwd" name="password" type="password" placeholder="Password" />
                <Input id="pwd-cnf" type="password" placeholder="Confirm password"
                    onChange={passwordsValidator} />
                <div id="does-password-match" style={{
                    fontFamily: 'raleway',
                    fontSize: "12px",
                    userSelect: "none",
                    textAlign: "end",
                    margin: "0px 16px",
                    color: (isRegisterStatusGreen ? Colors.primary : "red")
                }}>
                    {registerStatus}
                </div>
                <div id="currency" style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    margin: "12px 0px 12px 0px",
                    height: "30px"
                }}>
                    <div style={{
                        margin: "0px 0px 0px 16px",
                        fontFamily: "raleway",
                        fontSize: "14px",
                        opacity: "0.7"
                    }}>Select your currency:</div>
                    <select name="currency" id="currency-selector" required style={{
                        width: "120px",
                        margin: "0px 0px 0px 16px"
                    }}>
                        {currency_options_list.map((currency) => {
                            return <option key={currency.cc} value={currency.cc}>
                                {`${currency.name} (${currency.symbol})`}
                            </option>
                        })}
                    </select>
                </div>
            </form>
            <motion.div id="login-button"
                style={{
                    margin: "8px",
                    width: "90%",
                    userSelect: "none",
                    color: Colors.black,
                    cursor: "pointer",
                    fontFamily: "oswald"
                }}
                whileHover={{ color: Colors.primaryDark }}
                onClick={switchToLoginHandler}>
                Already have an account?
            </motion.div>
            <Button id="signup-button" buttonText="Signup"
                onClickHandler={isRegisterStatusGreen ? signupHandler : null}
                style={{
                    alignSelf: "flex-end",
                    margin: "8px 16px 8px 0px",
                    opacity: (isButtonGreyedOut ? 1 : 0.6)
                }} />
            <div id="read-privacy-policy" style={{
                alignSelf: "flex-end",
                margin: "-4px 16px 8px 8px",
                userSelect: "none",
                paddingBottom: "4px"
            }}>
                <Link to="/faq" style={{
                    textDecoration: "none",
                    fontFamily: "raleway",
                    fontSize: "12px",
                    color: Colors.black
                }} whileHover={{ color: Colors.primaryDark }}>
                    What data gets stored?
                </Link>
            </div>
        </SignupContainer>
    )
}