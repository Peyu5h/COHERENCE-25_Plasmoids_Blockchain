import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const address = '0x31Af0e984E33DBD443ce5f511907B37274aF362C';

  useEffect(() => {
    initializeCamera();
  }, []);

  const initializeCamera = async () => {
    setIsLoading(true);
    try {
      await checkPermissions();
    } catch (error) {
      setErrorMessage('Failed to initialize camera');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setErrorMessage('Camera permission is required to scan QR codes');
      }
    }
  };

  const handleBarCodeScanned = async (event: { data: string }) => {
    try {
      await processScannedData(event.data);
    } catch (error) {
      setErrorMessage('Failed to process QR code');
    }
  };

  const processScannedData = async (data: string) => {
    try {
      const url = new URL(data);
      const updatedUrl = `${url.toString()}&address=${address}`;
      await Linking.openURL(updatedUrl);
      setScannedData(data);
    } catch (error) {
      setErrorMessage('Invalid QR code format');
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setErrorMessage('');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Loading Camera</Text>
          <Text style={styles.description}>Please wait while we initialize the camera...</Text>
          <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
        </View>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.description}>We need camera access to scan QR codes</Text>
          <View style={styles.buttonContainer}>
            <View style={styles.button} onTouchEnd={requestPermission}>
              <Text style={styles.buttonText}>Grant Permission</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.description}>{errorMessage}</Text>
          <View style={styles.buttonContainer}>
            <View style={styles.button} onTouchEnd={() => setErrorMessage('')}>
              <Text style={styles.buttonText}>Try Again</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scannedData ? (
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Scan Successful</Text>
          </View>
          <Text style={styles.description}>QR code has been successfully processed</Text>
          <Text style={styles.scannedData}>{scannedData}</Text>
          <View style={styles.buttonContainer}>
            <View style={styles.button} onTouchEnd={resetScanner}>
              <Text style={styles.buttonText}>Scan Another Code</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing="back" onBarcodeScanned={handleBarCodeScanned}>
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <Text style={styles.scanText}>Position QR code within the frame</Text>
              </View>
            </View>
          </CameraView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 16,
  },
  scannedData: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    position: 'absolute',
    top: -40,
    textAlign: 'center',
    width: '100%',
  },
  loader: {
    marginTop: 20,
  },
});
