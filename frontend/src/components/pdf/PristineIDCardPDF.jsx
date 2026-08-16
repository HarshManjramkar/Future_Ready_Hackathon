import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    width: 200,
    height: 310, // ~ CR80 ratio
    border: '1px solid #e1e8ef',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#0ea4e9',
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subHeaderText: {
    color: '#dff1fd',
    fontSize: 7,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  photo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    border: '2px solid #e1e8ef',
    objectFit: 'cover',
  },
  details: {
    padding: 15,
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f162a',
    marginBottom: 4,
  },
  role: {
    fontSize: 9,
    color: '#0284c6', // Sky 600
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 8,
    color: '#63748a',
    marginTop: 8,
  },
  barcodeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fb',
    borderTop: '1px dashed #cad4e0',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idNumber: {
    fontSize: 16,
    color: '#0f162a',
    letterSpacing: 4,
    fontWeight: 'black',
    textAlign: 'center',
  }
});

const PristineIDCardPDF = ({ cards, options = {} }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {cards.map((card, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Victory High School</Text>
              <Text style={styles.subHeaderText}>EduFlow OS Verified Credential</Text>
            </View>
            
            <View style={styles.photoContainer}>
              {card.avatar ? (
                <Image src={card.avatar} style={styles.photo} />
              ) : (
                <View style={{...styles.photo, backgroundColor: '#e1e8ef'}} />
              )}
            </View>

            <View style={styles.details}>
              <Text style={styles.name}>{card.name || 'Student Name'}</Text>
              <Text style={styles.role}>{card.role || 'Student'}</Text>
              <Text style={styles.meta}>Grade: {card.grade || 'N/A'}</Text>
              <Text style={styles.meta}>DOB: {card.dob || 'N/A'}</Text>
            </View>

            <View style={styles.barcodeArea}>
              <Text style={styles.idNumber}>{card.id ? `STU-${card.id}` : `STU-000${index}`}</Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default PristineIDCardPDF;
