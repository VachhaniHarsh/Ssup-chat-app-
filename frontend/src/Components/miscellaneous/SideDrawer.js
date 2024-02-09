import React, { useState } from 'react';
import { Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, Toast, useToast, Spinner, Badge, Icon } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider.js';
import ProfileModal from './ProfileModal.js';
import { useHistory } from 'react-router-dom';
import { color, warning } from 'framer-motion';
import axios from 'axios';
import ChatLoading from '../ChatLoading.js';
import UserListItem from '../UserAvatar/UserListItem.js';
import { getSender } from '../../config/ChatLogics.js';


const SideDrawer = () => {

  const [search, setSearch] = useState(""); 
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  
  const history = useHistory();
  
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };
  
  const toast = useToast();
  const handleSearch = async() => {
    if (!search) {
      toast({
        title: "Please enter something!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
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

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);

    } catch (error) {
      toast({
        title: "Error occured!",
        description : "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async(userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type" : "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();

    } catch (error) {
      toast({
        title: "Error fetching chats!",
        description : error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="4px">
        <Tooltip label="Search Users to Chat" hasArrow placement='bottom-end'>
          <Button variant="ghost" onClick={onOpen}>
            🔎 
            <Text display={{base:"none", md:"flex"}} px="4"> Search Users</Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">Ssup!</Text>

        <div>
          <Menu>
            <MenuButton p={1}>
              {notification.length > 0 ? (
                <div display="flex">
                  <BellIcon fontSize="2xl" m={1} color="red" />
                    {notification.length}
                </div>
              ) : (
                <div display="flex">
                  <BellIcon fontSize="2xl" m={1} color="black" />
                </div>
              )}
              {/* <BellIcon fontSize="2xl" m={1} /> */}
            </MenuButton>
            <MenuList paddingLeft={2}>
              {!notification.length && "No new messages!"}
              {notification.map(notif => (
                <MenuItem key={notif._id} onClick={() => { 
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter(n => n.chat._id !== notif.chat._id));
                }}>
                  {notif.chat.isGroupChat ? `New unread message in group : ${notif.chat.chatName}` : `${getSender(user,notif.chat.users)} sent you a message`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} />
            </MenuButton>

            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider/>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

          <DrawerBody>
          <Box display="flex" pb={2}>
            <Input 
              placeholder="Search by name or email"
              mr={2}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
            </Box>
            
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex"/>}
        </DrawerBody>

        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer;
