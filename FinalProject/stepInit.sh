 #!/bin/bash         

echo 30 > /sys/class/gpio/export
echo 31 > /sys/class/gpio/export
echo 48 > /sys/class/gpio/export
echo 5 > /sys/class/gpio/export
echo 22 > /sys/class/gpio/export
echo 27 > /sys/class/gpio/export

echo out > /sys/class/gpio/gpio30/direction
echo out > /sys/class/gpio/gpio31/direction
echo out > /sys/class/gpio/gpio48/direction
echo out > /sys/class/gpio/gpio5/direction
echo 'in' > /sys/class/gpio/gpio22/direction
echo out > /sys/class/gpio/gpio27/direction
