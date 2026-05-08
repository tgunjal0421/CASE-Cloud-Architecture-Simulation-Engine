class VirtualMachine:
    latency = 40

    def process(self):
        return self.latency


class Container:
    latency = 50

    def process(self):
        return self.latency


class ServerlessFunction:
    latency = 25

    def process(self):
        return self.latency