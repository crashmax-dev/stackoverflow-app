import { Box, Center, HStack, Image, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { stackoverflow } from '../../uitls/stackexchange-api';
import { useUser } from '../../contexts/use-user';
import { BsInboxFill } from 'react-icons/bs';
import { kFormatter } from '../../uitls/k-formatter';
import { useEffect } from 'react';
import { socketClient } from '../../uitls/stackexchange-socket-client';
import { notification } from '../../uitls/notitification';
import { useNavigate } from 'react-router-dom';
import { commandKey } from '../../uitls/command-key';

export function MenuDropdown() {
  const navigate = useNavigate();
  const user = useUser();

  function logout() {
    stackoverflow.get(`access-tokens/${localStorage.token}/invalidate`).then(() => {
      // window.Main.logout();
      window.Main.on('stackexchange-did-logout', () => {
        // console.log('LOGOUTED');
      });
    });
  }

  useEffect(() => {
    socketClient.on(`1-${user.user.user_id}-reputation`, () => {
      notification('Reputation', '+25');
    });

    socketClient.on(`${user.user.account_id}-inbox`, () => {
      notification('Inbox', 'You got new message');
    });
  }, []);

  function goToProfile() {
    navigate(`/users/${user.user.user_id}`, { state: user.user });
  }

  function goToSettings() {
    navigate('/settings');
  }

  return (
    <HStack justify="end" align="stretch" mr="16px" spacing={0}>
      <Center
        sx={{ WebkitAppRegion: 'no-drag' }}
        px="8px"
        rounded="3px"
        _hover={{ color: 'whiteAlpha.700', bgColor: 'whiteAlpha.50' }}
        color="whiteAlpha.600"
      >
        <Text fontSize="16px">
          <BsInboxFill />
        </Text>
        <Box boxSize="6px" bgColor="red.500" rounded="full" position="relative" ml="-1px" top="-6px" />
      </Center>
      <Center
        sx={{ WebkitAppRegion: 'no-drag' }}
        px="8px"
        rounded="3px"
        _hover={{ color: 'whiteAlpha.700', bgColor: 'whiteAlpha.50' }}
        color="whiteAlpha.600"
      >
        <Text fontSize="12px" fontWeight="semibold">
          {kFormatter(user.user.reputation)}
          <Text as="span" ml="3px" px="3px" mt="1px" bgColor="green.400" color="whiteAlpha.800" rounded="2px">
            +25
          </Text>
        </Text>
      </Center>

      <Menu>
        <MenuButton
          marginStart="10px !important"
          _hover={{ filter: 'brightness(1.1)' }}
          sx={{ WebkitAppRegion: 'no-drag' }}
        >
          <Image src={user.user.profile_image} boxSize="25px" objectFit="cover" borderRadius="5px" />
        </MenuButton>
        <MenuList zIndex={200}>
          <MenuItem onClick={goToProfile} command={commandKey(['P'])}>
            Profile
          </MenuItem>
          <MenuItem onClick={goToSettings} command={commandKey([','])}>
            Settings
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={logout}>Logout</MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
}
