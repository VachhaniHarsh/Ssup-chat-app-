import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    IconButton,
    Button,
    useToast,
    Box,
    FormLabel,
    FormControl,
    Input,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {

    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameloading] = useState(false);

    const toast = useToast();
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { selectedChat, setSelectedChat, user } = ChatState();

    const handleRemove = async (user1) => {

        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            return;
        }

        try {
            setLoading(true);
            
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put("/api/chat/groupremove", { chatId: selectedChat._id, userId: user1._id }, config);
            
            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);

        } catch (error) {
            toast({
                title: "Error occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    }  

    const handleRename = async () => {
        if (!groupChatName) {
            return;
        }

        try {
            setRenameloading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put("/api/chat/rename", { chatId: selectedChat._id, chatName: groupChatName }, config);
            
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameloading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });

            setRenameloading(false);
        }

        setGroupChatName("");
    };

    const handleSearch = async (query) => {
        setSearch(query);

        if (!query) {
            return;
        }

        try {
            setLoading(true);
            
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setLoading(false);
        }
        
    };

    const handleAddUser = async(user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User already in the group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            return;
        }

        try {
            setLoading(true);
            
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put("/api/chat/groupadd", { chatId: selectedChat._id, userId: user1._id }, config);
            
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);

        } catch (error) {
            toast({
                title: "Error occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    }  

  return (
      <div>
          
        <IconButton display={{base:"flex"}} icon={<ViewIcon/>} onClick={onOpen}/>


        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                  <ModalHeader
                      fontSize="35px"
                      fontFamily="Work sans"
                      display="flex"
                      justifyContent="center"
                  >{selectedChat.chatName}</ModalHeader>
            <ModalCloseButton />
                  <ModalBody>
                      
                      <Box display="flex" w="100%" flexWrap="wrap" pb={3}>
                        {selectedChat.users.map(u => (
                            <UserBadgeItem key={u._id} user={u} handleFunction={()=>handleRemove(u)} />
                        ))}
                      </Box>

                      <FormControl display="flex">
                          <Input placeholder="Update Chat Name" mb={3}
                              value={groupChatName}
                            onChange={(e) => setGroupChatName(e.target.value)}
                          />

                          <Button
                              variant="solid"
                              colorScheme="teal"
                              ml={1}
                              isLoading={renameloading}
                              onClick={handleRename}
                          >
                              Update
                          </Button>
                      </FormControl>

                      <FormControl>
                          <Input placeholder="Add Users to group" mb={1}
                            onChange={(e) => handleSearch(e.target.value)}
                          />
                      </FormControl>
                      
                      <Box display="flex" w="100%" flexWrap="wrap">
                        {searchResult.map(u => (
                            <UserListItem key={u._id} user={u} handleFunction={()=>handleAddUser(u)} />
                        ))}
                      </Box>

            </ModalBody>

            <ModalFooter>
            <Button colorScheme='red' onClick={()=>handleRemove(user)}>
              Leave Group
            </Button>
            </ModalFooter>
            </ModalContent>
      </Modal>
      
    </div>
  )
}

export default UpdateGroupChatModal;
