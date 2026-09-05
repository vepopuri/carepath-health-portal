import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { documentService } from '../services';
import type { DocumentCategory, PortalDocument } from '../types/domain';

const CATEGORY_ICON: Record<DocumentCategory, typeof BadgeOutlinedIcon> = {
  id_card: BadgeOutlinedIcon,
  eob: ReceiptLongOutlinedIcon,
  plan_document: ArticleOutlinedIcon,
  tax_form: RequestQuoteOutlinedIcon,
  other: ArticleOutlinedIcon,
};

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  id_card: 'ID card',
  eob: 'Explanation of benefits',
  plan_document: 'Plan documents',
  tax_form: 'Tax forms',
  other: 'Other',
};

export function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService.list().then((result) => {
      setDocuments(result);
      setLoading(false);
    });
  }, []);

  const groups = useMemo(() => {
    const byCategory = new Map<DocumentCategory, PortalDocument[]>();
    for (const d of documents) {
      if (!byCategory.has(d.category)) byCategory.set(d.category, []);
      byCategory.get(d.category)!.push(d);
    }
    return Array.from(byCategory.entries());
  }, [documents]);

  return (
    <Box>
      <PageHeader title="Documents" description="Your ID card, explanations of benefits, plan documents, and tax forms." breadcrumbs={['Overview', 'Documents']} />

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {groups.map(([category, items]) => {
        const Icon = CATEGORY_ICON[category];
        return (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              {CATEGORY_LABEL[category]}
            </Typography>
            <Paper>
              <List disablePadding>
                {items.map((d, i) => (
                  <Box key={d.id}>
                    <ListItem
                      sx={{ py: 1.5 }}
                      secondaryAction={
                        <Button size="small" startIcon={<DownloadOutlinedIcon />} onClick={() => (d.relatedClaimId ? navigate(`/claims/${d.relatedClaimId}`) : undefined)}>
                          {d.relatedClaimId ? 'View claim' : 'View'}
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Icon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={d.title}
                        secondary={`${d.description} · ${new Date(d.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                    {i < items.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
}
