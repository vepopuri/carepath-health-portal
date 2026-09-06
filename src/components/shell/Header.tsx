import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarePathMark } from '../common/CarePathMark';
import { memberService } from '../../services';
import type { Member } from '../../types/domain';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    memberService.getMember().then(setMember);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ bgcolor: 'brand.ink', color: '#fff', zIndex: (t) => t.zIndex.drawer + 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }} aria-label="Toggle navigation">
          <MenuIcon />
        </IconButton>

        <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer', mr: 1 }} onClick={() => navigate('/')}>
          <CarePathMark size={30} />
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.01em' }}>
              CarePath
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.400', lineHeight: 1 }}>
              Health plan member portal
            </Typography>
          </Box>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', display: { xs: 'none', md: 'block' } }} />

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.08)',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            flexGrow: 1,
            maxWidth: 360,
            ml: 1,
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: 'grey.400', mr: 1 }} />
          <InputBase
            placeholder="Search claims, providers, documents…"
            sx={{ color: '#fff', fontSize: '0.875rem', width: '100%' }}
            inputProps={{ 'aria-label': 'Global search' }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Notifications (demo)">
          <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)} aria-label="Notifications">
            <Badge badgeContent={2} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">Notifications</Typography>
          </Box>
          <Divider />
          <Box sx={{ px: 2, py: 1, maxWidth: 320 }} onClick={() => { setNotifAnchor(null); navigate('/claims'); }} style={{ cursor: 'pointer' }}>
            <Typography variant="body2">Your knee MRI claim is in review with your insurer.</Typography>
          </Box>
          <Divider />
          <Box sx={{ px: 2, py: 1, maxWidth: 320 }} onClick={() => { setNotifAnchor(null); navigate('/prior-authorizations'); }} style={{ cursor: 'pointer' }}>
            <Typography variant="body2">A prior authorization request is awaiting a decision.</Typography>
          </Box>
        </Menu>

        <Tooltip title="Help">
          <IconButton color="inherit" aria-label="Help">
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} aria-label="Account menu">
            <Avatar sx={{ width: 30, height: 30, bgcolor: 'secondary.main', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
              {member?.name.slice(0, 1) ?? ''}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)}>
          <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
            <Typography variant="subtitle2">{member?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Member #{member?.memberNumber}
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
