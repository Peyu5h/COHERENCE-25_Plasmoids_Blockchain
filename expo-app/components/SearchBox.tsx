import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';

interface MapboxSuggestion {
  name?: string;
  full_address?: string;
  place_formatted?: string;
  mapbox_id: string;
}

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
  MAPBOX_ACCESS_TOKEN: string;
}

export default function SearchBox({ onLocationSelect, MAPBOX_ACCESS_TOKEN }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [toAddressList, setToAddressList] = useState<MapboxSuggestion[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (inputValue && inputValue !== selectedAddress) {
      timeoutId = setTimeout(() => {
        getAddress(inputValue);
      }, 500);
    } else {
      setToAddressList([]);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [inputValue, selectedAddress]);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    onLocationSelect(currentLocation.coords.latitude, currentLocation.coords.longitude);
  };

  const getAddress = async (query: string) => {
    try {
      const session_token = uuidv4();
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${query}&language=en&limit=5&session_token=${session_token}&country=IN&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      setToAddressList(data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleToAddressClick = async (address: MapboxSuggestion) => {
    const addressText = address.name || address.place_formatted || '';
    setSelectedAddress(addressText);
    setInputValue(addressText);
    setToAddressList([]);

    try {
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${address.mapbox_id}?session_token=1234&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      const coordinates = data.features[0].geometry.coordinates;
      onLocationSelect(coordinates[1], coordinates[0]);
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text !== selectedAddress) {
      setSelectedAddress('');
    }
    if (!text) {
      setToAddressList([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder="Enter your location"
        />
        <TouchableOpacity style={styles.iconButton} onPress={getUserLocation} activeOpacity={0.7}>
          <FontAwesome5 name="map-marker-alt" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {toAddressList.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            style={styles.resultsList}
            data={toAddressList.filter((item) => item?.name || item?.full_address)}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => {
              const mainText = item.name || item.place_formatted || '';
              const subText = item.place_formatted !== mainText ? item.place_formatted : '';

              return (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleToAddressClick(item)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.mainText}>{mainText}</Text>
                    {subText ? <Text style={styles.subText}>{subText}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    backgroundColor: 'white',
    maxHeight: 200,
    borderRadius: 8,
    marginTop: 5,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mainText: {
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  resultsContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
