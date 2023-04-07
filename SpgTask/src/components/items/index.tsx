import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import Grid from './grid';
import axios from 'axios';
import Loading from '../loading';
import Notification from '../notification';

const columns = [
  {
    field: 'dessert',
    headerName: 'Dessert',
    width: 250,
    editable: true,
    type: 'string',
  },
  {
    field: 'calories',
    headerName: 'Calories',
    width: 200,
    editable: true,
    type: 'number',
  },
  {
    field: 'carbs',
    headerName: 'Carbs',
    width: 200,
    type: 'number',
    editable: true,
  },

  {
    field: 'fat',
    headerName: 'Fat',
    width: 200,
    type: 'number',
    editable: true,
  },

  {
    field: 'protein',
    headerName: 'Protein',
    width: 200,
    type: 'number',
    editable: true,
  },
];
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 5,
  borderColor: 'primary',
};
const Items = (props: {
  user: { id: string; email: string; password: string; token: string };
}) => {
  let getURL = `https://pei26i9x39.execute-api.ca-central-1.amazonaws.com/dev-amirh/user?userID=${props.user.id}&token=${props.user.token}&filterBy=ALL&page=1&itemPerPage=100`;
  let url =
    'https://pei26i9x39.execute-api.ca-central-1.amazonaws.com/dev-amirh';
  const [data, setData] = useState([]);
  const getData = () => {
    setData([]);
    setIsLoading(true);
    let resp = axios.get(getURL);
    resp
      .then((res) => {
        setData(res.data.items);
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => {
    getData();
  }, []);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoti, setShowNoti] = useState<boolean>(false);
  const [notiMessage, setNotiMessage] = useState<string>('');
  const [notiType, setNotiType] = useState<string>('');

  const [dessert, setDessert] = useState('');
  const [calories, setCalories] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [protein, setProtein] = useState(0);

  const [selectedItem, setSelectedItem] = useState();

  const deleteItem = () => {
    setIsLoading(true);
    let response = axios.delete(url, {
      data: {
        item: selectedItem,
        userID: props.user.id,
        token: props.user.token,
      },
    });
    response
      .then((res) => {
        setNotiType('success');
        setNotiMessage('Your item successfully deleted');
        setShowNoti(true);
        getData();
      })
      .catch((e) => {
        setNotiType('error');
        setNotiMessage('Some thing went wrong. Please try again later');
        setShowNoti(true);
        console.log(e);
      })
      .finally(() => setIsLoading(false));
  };

  const saveHandler = () => {
    setIsLoading(true);
    let response = axios.post(url, {
      item: {
        id: uuidv4().toString().trim(),
        dessert: dessert.trim(),
        calories: calories,
        carbs: carbs,
        fat: fat,
        protein: protein,
        userID: props.user.id,
      },
      userID: props.user.id,
      token: props.user.token,
    });
    response
      .then((res) => {
        setNotiType('success');
        setNotiMessage('Your item successfully added');
        setShowNoti(true);
        getData();
      })
      .catch((e) => {
        setNotiMessage('Some thing went wrong. Please try again later');
        setNotiType('error');
        setShowNoti(true);
        console.log(e);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      {isLoading === true && <Loading />}
      <>
        <Grid
          width={'98%'}
          height={'500px'}
          columns={columns}
          rows={data}
          pageSize={100}
          rowsPerPageOptions={100}
          onClick={(id: string) => {
            setSelectedItem(data.find((_) => (_ as any)?.id === id));
          }}
        ></Grid>
        <IconButton
          disabled={isLoading}
          aria-label='delete'
          color='primary'
          onClick={() => {
            deleteItem();
          }}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            setModalIsOpen(true);
          }}
          color='primary'
          aria-label='add to shopping cart'
        >
          <AddIcon />
        </IconButton>

        <Modal
          open={modalIsOpen}
          onClose={() => {
            setModalIsOpen(false);
          }}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box sx={style}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label='Dessert'
                id='Dessert'
                value={dessert}
                onChange={(e: any) => {
                  setDessert(e.target.value);
                }}
              />
              <TextField
                fullWidth
                label='Calories'
                id='Calories'
                type={'number'}
                value={calories}
                onChange={(e: any) => {
                  setCalories(e.target.value);
                }}
              />
              <TextField
                fullWidth
                label='Carbs'
                id='Carbs'
                type='number'
                value={carbs}
                onChange={(e: any) => {
                  setCarbs(e.target.value);
                }}
              />
              <TextField
                fullWidth
                label='Fat'
                id='Fat'
                type='number'
                value={fat}
                onChange={(e: any) => {
                  setFat(e.target.value);
                }}
              />
              <TextField
                fullWidth
                label='Protein'
                id='Protein'
                type='number'
                value={protein}
                onChange={(e: any) => {
                  setProtein(e.target.value);
                }}
              />
            </Stack>
            <Stack spacing={1} padding={1} direction='row'>
              <Button
                variant='contained'
                disabled={isLoading}
                onClick={saveHandler}
              >
                Save
              </Button>
              <Button
                variant='outlined'
                onClick={() => {
                  setModalIsOpen(false);
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Notification
          onClose={() => {
            setShowNoti(false);
          }}
          message={notiMessage}
          showNoti={showNoti}
          type={notiType}
        ></Notification>
      </>
    </>
  );
};

export default Items;
