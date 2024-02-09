import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Box,
} from '@chakra-ui/react'
import { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';


const GroupChatModal = ({ children }) => {
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { user, chats, setChats } = ChatState();

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

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post("/api/chat/group", {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id))
            }, config);

            setChats([data, ...chats]);
            onClose();

            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });



        } catch (error) {
            toast({
                title: "Failed to create the group chat",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const handleGroup = (userToAdd) => {
        
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);

    };

    const handleDelete = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== userToDelete._id));
    }  

  return (
      <div>
          <span onClick={onOpen}>{children}</span>
        
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                  <ModalHeader
                    fontSize="35px"
                    fontFamily="Work sans"
                    display="flex"
                    justifyContent="center"
                  >
                    Create Group Chat
                  </ModalHeader>
            <ModalCloseButton />
                  
                  <ModalBody
                      display="flex"
                      flexDir="column"
                      alignItems="center"
                  >
                    
                      <FormControl>
                          <FormLabel>Change Group Name</FormLabel>
                          <Input placeholder="Chat Name" mb={3}
                            onChange={(e) => setGroupChatName(e.target.value)}
                          />
                      </FormControl>
                      
                      <FormControl>
                          <FormLabel>Add users</FormLabel>
                          <Input placeholder="Add Users eg: John, Ethan, Jordan" mb={1}
                            onChange={(e) => handleSearch(e.target.value)}
                          />
                      </FormControl>

                      <Box display="flex" w="100%" flexWrap="wrap">
                        {selectedUsers.map(u => (
                            <UserBadgeItem key={u._id} user={u} handleFunction={()=>handleDelete(u)} />
                        ))}
                      </Box>
                      
                      {loading ? <div><Spinner/></div> : (
                          searchResult?.slice(0, 4).map(user => (
                              <UserListItem key={user._id} user={user} handleFunction={()=>handleGroup(user)}/>
                          ))
                      )}
            
                  </ModalBody>

            <ModalFooter>
                <Button colorScheme='blue' onClick={handleSubmit}>
                Create Chat
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>

    </div>
  )
}

export default GroupChatModal;
