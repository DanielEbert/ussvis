#include <cstring>
#include <iostream>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <chrono>
#include <thread>
#include <tuple>
#include <vector>

#include "json.hpp"

class VisuSender
{
  public:
    VisuSender(uint32_t destination_port = 8032)
    {
        sock = socket(AF_INET, SOCK_DGRAM, 0);
        if (sock == -1)
        {
            std::cerr << "Error creating VisuSender socket: " << std::strerror(errno) << '\n';
            return;
        }

        std::memset(&dest_addr, 0, sizeof(dest_addr));
        dest_addr.sin_family = AF_INET;
        dest_addr.sin_port = htons(destination_port);
        dest_addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

        isConnected = true;
    };

    bool send(uint8_t* data, size_t data_size)
    {
        if (!isConnected)
        {
            return false;
        }

        ssize_t total_sent_size{0};
        while (total_sent_size != data_size)
        {
            ssize_t sent_size =
                sendto(sock, data, data_size, 0, reinterpret_cast<sockaddr*>(&dest_addr), sizeof(dest_addr));

            if (sent_size == -1)
            {
                std::cerr << "Error sending data: " << std::strerror(errno) << '\n';
                // Don't set isConnected = false because the udp server may be open in an upcoming send() call.
                return false;
            }

            total_sent_size += sent_size;
        }

        return true;
    }

  private:
    bool isConnected{false};
    int sock{0};
    sockaddr_in dest_addr;
};

int main()
{
    VisuSender sender;

    std::vector<std::tuple<int, int>> tuples = {{1, 2}, {3, 4}, {5, 6}};

    nlohmann::json jsonArray;

    for (const auto& tup : tuples)
    {
        nlohmann::json jsonObj;
        jsonObj.push_back(std::get<0>(tup));
        jsonObj.push_back(std::get<1>(tup));
        jsonArray.push_back(jsonObj);
    }

    std::string jsonString = jsonArray.dump(4);

    while (true)
    {
        sender.send(reinterpret_cast<uint8_t*>(&jsonString[0]), jsonString.size());
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        std::cout << "sending" << std::endl;
    }
}
