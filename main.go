package main

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	//"github.com/libp2p/go-libp2p"
)

// <============================ Broker Subcription Topic's ==================================>//
const parietalLiDARTopic = "parietal/liDAR"
const parietalCameraTopic = "parietal/camera"
const parietalGpsTopic = "parietal/gps"
const parietalImuTopic = "parietal/imu"
const parietalWeatherTopic = "parietal/weather"
const parietalvehicleTelTopic = "parietal/vehicleTel"

// <============================ Broker Subcription Topic's ==================================>//
// const protocol = "ws"
// const host = "broker.emqx.io"
// const port = "8083"
// const path = "/mqtt"
// const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = "ws://broker.emqx.io:8083/mqtt"

func main() {
	r := rand.New(rand.NewSource(time.Now().UnixNano())) // seed the random generator
	clientId := fmt.Sprintf("mqtt_%x", r.Int63())

	messageHandler := func(client mqtt.Client, msg mqtt.Message) {
		fmt.Printf("\n Message received:\nTopic: %s\nPayload: %s\n", msg.Topic(), msg.Payload())
	}

	opts := mqtt.NewClientOptions()
	opts.AddBroker(connectUrl)
	opts.SetClientID(clientId)

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	if token := client.Subscribe(parietalLiDARTopic, 0, messageHandler); token.Wait() && token.Error() != nil {
		fmt.Println(token.Error())
		os.Exit(1)
	}

	var payload = "Message to the sent"

	if token := client.Publish(parietalLiDARTopic, 0, false, payload); token.Wait() && token.Error() != nil {
		fmt.Println(token.Error())
		os.Exit(1)
	}

	fmt.Println(client.IsConnected())

	for {
		time.Sleep(2 * time.Second)
	}
}
