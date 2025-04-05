import React, { memo } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';
import LottieView from 'lottie-react-native';

const emojiMap = {
  ':p1:': require('../assets/animations/emoji42.json'),
  ':p2:': require('../assets/animations/emoji43.json'),
  ':p3:': require('../assets/animations/emoji44.json'),
  ':p4:': require('../assets/animations/emoji45.json'),
  ':p5:': require('../assets/animations/emoji46.json'),
  ':p6:': require('../assets/animations/emoji47.json'),
  ':p7:': require('../assets/animations/emoji48.json'),
  ':p8:': require('../assets/animations/emoji49.json'),
  ':p9:': require('../assets/animations/emoji50.json'),
  ':p10:': require('../assets/animations/emoji51.json'),

   // new emojis
   ':a1:': require('../assets/animations/emoji52.json'),
   ':a2:': require('../assets/animations/emoji53.json'),
   ':a3:': require('../assets/animations/emoji54.json'),
   ':a4:': require('../assets/animations/emoji55.json'),
   ':a5:': require('../assets/animations/emoji56.json'),
   ':a6:': require('../assets/animations/emoji57.json'),
   ':a7:': require('../assets/animations/emoji58.json'),
   ':a8:': require('../assets/animations/emoji59.json'),
   ':a10:': require('../assets/animations/emoji61.json'),
   ':b1:': require('../assets/animations/emoji62.json'),
   ':b2:': require('../assets/animations/emoji63.json'),
   ':b3:': require('../assets/animations/emoji64.json'),
   ':b4:': require('../assets/animations/emoji65.json'),
   ':b5:': require('../assets/animations/emoji66.json'),
   ':b6:': require('../assets/animations/emoji67.json'),
   ':b7:': require('../assets/animations/emoji68.json'),
   ':b8:': require('../assets/animations/emoji69.json'),
   ':b9:': require('../assets/animations/emoji70.json'),
   ':b10:': require('../assets/animations/emoji71.json'),

   ':d1:': require('../assets/animations/emoji72.json'),
   ':d2:': require('../assets/animations/emoji77.json'),
   
  

   // new emojis till this line

  ':g:': require('../assets/animations/emoji1.json'),
  ':m:': require('../assets/animations/emoji2.json'),
  ':j:': require('../assets/animations/emoji3.json'),
  ':b:': require('../assets/animations/emoji4.json'),
  ':c:': require('../assets/animations/emoji5.json'),
  ':d:': require('../assets/animations/emoji6.json'),
  ':e:': require('../assets/animations/emoji7.json'),
  ':f:': require('../assets/animations/emoji8.json'),
  ':g1:': require('../assets/animations/emoji9.json'),
  ':h:': require('../assets/animations/emoji10.json'),
  ':i:': require('../assets/animations/emoji11.json'),
  ':j1:': require('../assets/animations/emoji12.json'),
  ':k:': require('../assets/animations/emoji13.json'),
  ':l:': require('../assets/animations/emoji14.json'),
  ':m1:': require('../assets/animations/emoji15.json'),
  ':n:': require('../assets/animations/emoji16.json'),
  ':o:': require('../assets/animations/emoji17.json'),
  ':p:': require('../assets/animations/emoji18.json'),
  ':q:': require('../assets/animations/emoji19.json'),
  ':r:': require('../assets/animations/emoji20.json'),
  ':s:': require('../assets/animations/emoji21.json'),
  ':t:': require('../assets/animations/emoji22.json'),
  ':u:': require('../assets/animations/emoji23.json'),
  ':v:': require('../assets/animations/emoji24.json'),
  ':w:': require('../assets/animations/emoji25.json'),
  ':x:': require('../assets/animations/emoji26.json'),
  ':y:': require('../assets/animations/emoji27.json'),
  ':z:': require('../assets/animations/emoji28.json'),
  ':am1:': require('../assets/animations/emoji29.json'),
  ':am2:': require('../assets/animations/emoji30.json'),
  ':am3:': require('../assets/animations/emoji31.json'),
  ':am4:': require('../assets/animations/emoji32.json'),
  ':am5:': require('../assets/animations/emoji33.json'),
  ':am6:': require('../assets/animations/emoji34.json'),
  ':am7:': require('../assets/animations/emoji35.json'),
  ':am8:': require('../assets/animations/emoji36.json'),
  ':am9:': require('../assets/animations/emoji37.json'),
  ':am10:': require('../assets/animations/emoji38.json'),
  ':am11:': require('../assets/animations/emoji39.json'),
  ':am12:': require('../assets/animations/emoji40.json'),
  ':am13:': require('../assets/animations/emoji41.json'),
};

const MessageItem = ({ item, renderUserOptions, handleImageClick }) => {
  const userId = item.userId?._id || item.userId; // Ensure userId is correctly set

  const renderMessageContent = () => {
    if (!item.message || typeof item.message !== 'string') {
      return null;
    }

    if (item.message.endsWith('.jpg') || item.message.endsWith('.jpeg') || item.message.endsWith('.png')) {
      return (
        <TouchableOpacity onPress={() => handleImageClick(item.message)}>
          <Text style={styles.imageLink}>{item.message}</Text>
        </TouchableOpacity>
      );
    }

    const parts = item.message.split(/(:\w+:)/g); // Split message by short codes
    return parts.map((part, index) => {
      if (emojiMap[part]) {
        return (
          <LottieView
            key={index}
            source={emojiMap[part]}
            autoPlay
            loop
            style={styles.emoji}
          />
        );
      } else {
        return <Text key={index} style={styles.textPart}>{part}</Text>;
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => renderUserOptions(userId)}>
      <View style={styles.messageContainer}>
        <Avatar avatarPath={item.avatar} isOnline={item.userId?.isOnline} auraColor={item.nicknameColor} />
        <View style={styles.messageContent}>
          <Text style={[styles.messageText, { color: item.chatTextColor, fontWeight: 'bold' }]}>
            <Text style={[styles.nickname, { color: item.nicknameColor, fontWeight: 'bold' }]}>{item.nickname}: </Text>
            {renderMessageContent()}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  messageText: {
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10, // Add margin to the right to prevent overflow
    fontWeight: 'bold', // Make chat text bold
    paddingRight: 30, // Add padding to the right to ensure no characters are cut off
  },
  nickname: {
    fontWeight: 'bold', // Make nickname bold
    fontSize: 16,
  },
  imageLink: {
    color: '#16eff5', // Set the image link color
    fontWeight: 'bold', // Make the font bold
    textDecorationLine: 'underline',

  },
  emoji: {
    width: 24, // Adjust size as needed
    height: 24, // Adjust size as needed
    marginBottom: -5, // Adjust to align with text
  },
  textPart: {
    lineHeight: 24, // Ensure the text line height matches the emoji height
  },
});

export default memo(MessageItem, (prevProps, nextProps) => prevProps.item._id === nextProps.item._id);