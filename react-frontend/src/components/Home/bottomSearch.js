import React, { useState } from 'react'
import styled from 'styled-components'
import {AiOutlineSearch} from 'react-icons/ai'
import "../../css/bottomSearch.css"
import {Box, TextField, MenuItem} from '@mui/material';

export const SearchNav = styled.nav`
  background: #FFFFFF;
  height: 108px;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem calc((100vw - 1000px) / 2);
  z-index: 10;
`;

const SearchContainer = styled.div`
    position: relative;
    width: 360px;
    height: 52px;
    top: 25.06px;
    background: #F2F4F8;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 5px;
    translate: all 0.3s ease;
`;

const SearchInput = styled.input`
    padding-left: 48px;
    border: none;
    border-radius: 10px;
    position: relative;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: transparent;
    outline: none;
    font-size: 16px;
    border: 1px solid transparent;
    &:focus {
        border-color: rgba(0, 0, 0, 0.3)
    }
`;

const IconButton = styled.button`
    top: 3px;
    position: relative;
    height: 36px;
    width: 36px;
    border: none;
    z-index: 1;
    cursor: pointer;
    background: none;
`;

export const ButtonBox = styled.nav`
  display: flex;
  align-items: center;
  margin-right: -44px;
`;

export const Button = styled.button`
  position: relative;
  width: 90px;
  height: 55px;
  right: 185px;
  top: 5px;
  border-radius: 8px;
  background: #000;
  color: #fff;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;

  &:hover {
    transition: all 0.2s ease-in-out;
    background: #929292;
    color: #fff;
  }
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9999; /* Set a higher z-index value */
`;

const DropdownListItem = styled.li`
  padding: 5px 10px;
  cursor: pointer;
  margin-left: 50px;

  &:hover {
    background-color: #f2f2f2;
  }
`;

export function Select() {
    //const [Category, setCategory] = useState('');
    return (
        <Box width='200px' position="relative" top="22.5px" height="42px" right="90px">
            <TextField id="Select" label="All Categories" select fullWidth>
                <MenuItem value='PlaceHolder'> PlaceHolder </MenuItem>
                <MenuItem value='PlaceHolder'> PlaceHolder </MenuItem>
                <MenuItem value='PlaceHolder'> PlaceHolder </MenuItem>
                <MenuItem value='PlaceHolder'> PlaceHolder </MenuItem>
            </TextField>
        </Box>
    );
}

export default function BottomSearchbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [ingredientList, setIngredientList] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        setShowDropdown(true);
      };
    
      const handleAddIngredient = () => {
        if (searchQuery.trim() !== '') {
          setIngredientList((prevIngredientList) => [...prevIngredientList, searchQuery]);
          setSearchQuery('');
          setShowDropdown(false);
        }
      };

      const handleDropdownItemClick = (ingredient) => {
        setSearchQuery(ingredient);
        setShowDropdown(false);
      };    

      const handleConsoleLog = () => {
        console.log(ingredientList);
      };

    return (
        <>
            <SearchNav>
                <SearchContainer>
                    <IconButton > 
                            <AiOutlineSearch size={25}/>
                    </IconButton>
                    <SearchInput 
                        placeholder="Food Ingredients" 
                        size="100px"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        list="ingredientsList"
                    />
                    {showDropdown && searchQuery && (
                        <DropdownList>
                        {ingredientList.map((ingredient, index) => (
                            <DropdownListItem key={index} onClick={() => handleDropdownItemClick(ingredient)}>
                            {ingredient}
                            </DropdownListItem>
                        ))}
                        </DropdownList>
                    )}
                    </SearchContainer>

                <Button onClick={handleAddIngredient}>Add Ingredient</Button>

                <Select id="Select"/>
                <ButtonBox>
                    <Button onClick={handleConsoleLog} > Search </Button>
                </ButtonBox>
            </SearchNav>
        </>
    );
}