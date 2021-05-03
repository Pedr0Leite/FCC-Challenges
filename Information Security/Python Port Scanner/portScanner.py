#!/usr/bin/python3
import socket, argparse, sys, nmap

scanner = nmap.PortScanner()

print('Lets start the scan!')
print('<------------------------------------------>')

ipAddress = input("Please, enter an IP address or website to scan: ")
print("The IP Address is: ", ipAddress)
type(ipAddress)

resp = input("""\nPlease enter the type of scan you want to run
                  1)SYN ACK Scan
                  2)UDP Scan
                  3)Compreehensive Scan
                  \n
                  Type here: """)

print("You have selected the option: ", resp)

if resp == '1':
    print("Nmap version: ", scanner.nmap_version())
    scanner.scan(ipAddress, '1-1024', '-v -sS')
    print(scanner.scaninfo())
    print("IP Status: ", scanner[ipAddress].state)
    print(scanner[ipAddress].all_protocols())
    print("Open Ports: ", scanner[ipAddress]['tcp'].keys())
elif resp == '2':
    print("Nmap version: ", scanner.nmap_version())
    scanner.scan(ipAddress, '1-1024', '-v -sU')
    print(scanner.scaninfo())
    print("IP Status: ", scanner[ipAddress].state)
    print(scanner[ipAddress].all_protocols())
    print("Open Ports: ", scanner[ipAddress]['udp'].keys())
elif resp == '3':
    print("Nmap version: ", scanner.nmap_version())
    scanner.scan(ipAddress, '1-1024', '-v -sS -sV -sC -A -O')
    print(scanner.scaninfo())
    print("IP Status: ", scanner[ipAddress].state)
    print(scanner[ipAddress].all_protocols())
    print("Open Ports: ", scanner[ipAddress]['tcp'].keys())
elif resp >= '4':
    print("Please, choose a valid option!")
    resp = input("""\nPlease enter the type of scan you want to run
                  1)SYN ACK Scan
                  2)UDP Scan
                  3)Compreehensive Scan
                  \n
                  Type here: """)