import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type NavGroup = 'Care' | 'Claims & billing';

export const NAV_ITEMS: { key: string; label: string; path: string; icon: typeof DashboardOutlinedIcon; group?: NavGroup }[] = [
  { key: 'overview', label: 'Overview', path: '/', icon: DashboardOutlinedIcon },
  { key: 'plan', label: 'My Plan', path: '/plan', icon: ArticleOutlinedIcon, group: 'Care' },
  { key: 'family', label: 'Family', path: '/family', icon: FamilyRestroomOutlinedIcon, group: 'Care' },
  { key: 'find-care', label: 'Find Care', path: '/find-care', icon: SearchOutlinedIcon, group: 'Care' },
  { key: 'claims', label: 'Claims', path: '/claims', icon: ReceiptLongOutlinedIcon, group: 'Claims & billing' },
  { key: 'prior-authorizations', label: 'Prior Authorizations', path: '/prior-authorizations', icon: FactCheckOutlinedIcon, group: 'Claims & billing' },
  { key: 'billing', label: 'Billing & Payments', path: '/billing', icon: PaymentsOutlinedIcon, group: 'Claims & billing' },
  { key: 'documents', label: 'Documents', path: '/documents', icon: DescriptionOutlinedIcon, group: 'Claims & billing' },
];

const GROUP_ORDER: NavGroup[] = ['Care', 'Claims & billing'];

export const DRAWER_WIDTH = 240;

export function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = useAuth();

  const ungrouped = NAV_ITEMS.filter((item) => !item.group);
  const grouped = GROUP_ORDER.map((group) => ({ group, items: NAV_ITEMS.filter((item) => item.group === group) }));

  function renderItem(item: (typeof NAV_ITEMS)[number]) {
    const Icon = item.icon;
    const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
    return (
      <ListItemButton
        key={item.key}
        selected={active}
        onClick={() => {
          navigate(item.path);
          onClose();
        }}
        sx={{
          borderRadius: 2,
          mb: 0.25,
          color: active ? '#fff' : 'rgba(255,255,255,0.75)',
          bgcolor: active ? 'rgba(255,255,255,0.14)' : 'transparent',
          transition: 'background-color 150ms ease, color 150ms ease',
          '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)' },
          '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.14)' },
          '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
        }}
      >
        <ListItemIcon sx={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)', minWidth: 36 }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }} primary={item.label} />
      </ListItemButton>
    );
  }

  const content = (
    <Box sx={{ bgcolor: 'primary.dark', height: '100%', color: '#fff' }}>
      <Toolbar />
      <List sx={{ px: 1, pt: 1 }}>
        {ungrouped.map(renderItem)}
        {grouped.map(({ group, items }, i) => (
          <Box key={group} sx={{ mt: i === 0 ? 1.5 : 2 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', px: 1.5, display: 'block', mb: 0.5 }}>
              {group}
            </Typography>
            {items.map(renderItem)}
          </Box>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2, my: 1 }} />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
          Signed in as
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
          {member?.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
          Member #{member?.memberNumber}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
        open
      >
        {content}
      </Drawer>
    </Box>
  );
}
