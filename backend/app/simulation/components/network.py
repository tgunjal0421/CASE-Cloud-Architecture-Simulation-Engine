class LoadBalancer:
    latency = 10

    def process(self):
        return self.latency


class APIGateway:
    latency = 15

    def process(self):
        return self.latency