import React, {useState} from 'react';
import { FormControl, FormLabel, VStack, Input, InputGroup, InputRightElement, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';
import {useHistory} from 'react-router-dom';

const SignUp = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();

    const handleClick = () => {
        setShow(!show);
    };


    const submitHandler = async() => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
            toast({
                title: "Please fill all remaining fields!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (password != confirmpassword) {
            toast({
                title: "Passwords does not match!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post("/api/user",
                { name, email, password }, config);
            
            toast({
                title: "Registration successful!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            
            localStorage.setItem("userInfo", JSON.stringify(data));

            setLoading(false);
            history.push("/chats");
        }
        catch(error){
            toast({
                title: "Error occured!",
                status: error.response.data.message,
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            setLoading(false);
        }
    };

    return (
        <VStack spacing='5px' >
            <FormControl id="first-name" isRequired>
                <FormLabel> Name </FormLabel>
                <Input placeholder='Enter your name' onChange={(e) => setName(e.target.value)} />
            </FormControl>

            <FormControl id="signup_email" isRequired>
                <FormLabel> E-mail </FormLabel>
                <Input placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} />
            </FormControl>

            <FormControl id="signup_password" isRequired>
                <FormLabel> Password </FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} />
                
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id="confirm-password" isRequired>
                <FormLabel> Confirm Password </FormLabel>
                <InputGroup>
                    <Input type={show ? "text" : "password"} placeholder='Enter your password' onChange={(e) => setConfirmPassword(e.target.value)} />
                
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            {/* <FormControl id="pic">
                <FormLabel> Upload your Picture </FormLabel>
                <Input type='file' p={1.5} accept='image/*' onChange={(e) => postDetails(e.target.files[0])}>
                </Input>
            </FormControl> */}

            <Button
                colorScheme='blue'
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading = {loading}
            >
                SIGN UP
            </Button>
        </VStack>
    )
};

export default SignUp;
